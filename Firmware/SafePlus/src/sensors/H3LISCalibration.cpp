#include "H3LISCalibration.h"

// Global variables
H3LISCalibration h3lisCalibration = {0};
extern DFRobot_H3LIS200DL_I2C h3lis; // Reference to your main sensor object

// Add these constants if not defined in header
#ifndef ENHANCED_CALIBRATION_SAMPLES
#define ENHANCED_CALIBRATION_SAMPLES 400
#endif

#ifndef STABILITY_THRESHOLD
#define STABILITY_THRESHOLD 0.01f
#endif

#ifndef MAX_CALIBRATION_ERROR
#define MAX_CALIBRATION_ERROR 0.1f
#endif

// **NEW: Direct register reading function**
float readH3LISAxisDirect(uint8_t regLow) {
    Wire.beginTransmission(0x18);
    Wire.write(regLow);
    Wire.endTransmission(false);
    
    Wire.requestFrom(0x18, 1);
    uint8_t low = Wire.available() ? Wire.read() : 0;
    
    Wire.beginTransmission(0x18);
    Wire.write(regLow + 1);
    Wire.endTransmission(false);
    
    Wire.requestFrom(0x18, 1);
    uint8_t high = Wire.available() ? Wire.read() : 0;
    
    int16_t raw = (int16_t)((high << 8) | low);
    return (int8_t)(raw >> 8) * 0.78125; // Convert to g (±100g range)
}

// **FIXED: Use direct register reading**
bool checkSensorStability() {
    float readings[20];
    float sum = 0;
    
    // Take 20 readings over 1 second
    for (int i = 0; i < 20; i++) {
        // **CHANGED: Use direct register reading instead of library functions**
        float x = readH3LISAxisDirect(0x28); // X-axis
        float y = readH3LISAxisDirect(0x2A); // Y-axis
        float z = readH3LISAxisDirect(0x2C); // Z-axis
        
        readings[i] = sqrt(x*x + y*y + z*z);
        sum += readings[i];
        delay(50);
    }
    
    float mean = sum / 20;
    float variance = 0;
    
    for (int i = 0; i < 20; i++) {
        variance += pow(readings[i] - mean, 2);
    }
    variance /= 20;
    
    float stdDev = sqrt(variance);
    Serial.print("Sensor stability (std dev): ");
    Serial.println(stdDev, 6);
    
    return stdDev < STABILITY_THRESHOLD;
}

// **FIXED: Advanced calibration with direct register reading**
bool calibrateH3lisSensorAdvanced() {
    Serial.println("=== Advanced H3LIS200DL Calibration ===");
    Serial.println("This will perform a 6-position calibration for maximum accuracy.");
    
    float accSum[6][3] = {0}; // 6 positions, 3 axes
    const char* positions[] = {
        "LEVEL (Z-up)", "INVERTED (Z-down)", 
        "X-up", "X-down", "Y-up", "Y-down"
    };
    
    // Expected gravity values for each position [X, Y, Z]
    float expectedGravity[6][3] = {
        {0, 0, 1},   // Level (Z-up)
        {0, 0, -1},  // Inverted (Z-down)
        {1, 0, 0},   // X-up
        {-1, 0, 0},  // X-down
        {0, 1, 0},   // Y-up
        {0, -1, 0}   // Y-down
    };
    
    for (int pos = 0; pos < 6; pos++) {
        Serial.print("Position ");
        Serial.print(pos + 1);
        Serial.print("/6: Place sensor ");
        Serial.println(positions[pos]);
        Serial.println("Press any key when ready...");
        
        // Wait for user input
        while (!Serial.available()) {
            delay(100);
        }
        Serial.read(); // Clear input
        
        // Check stability
        Serial.println("Checking sensor stability...");
        if (!checkSensorStability()) {
            Serial.println("Sensor not stable! Please ensure no vibration and try again.");
            return false;
        }
        
        Serial.println("Taking measurements...");
        
        // Collect samples with outlier rejection
        float samples[3][ENHANCED_CALIBRATION_SAMPLES];
        int validSamples = 0;
        
        for (int i = 0; i < ENHANCED_CALIBRATION_SAMPLES; i++) {
            // **CHANGED: Use direct register reading**
            float x = readH3LISAxisDirect(0x28); // X-axis
            float y = readH3LISAxisDirect(0x2A); // Y-axis
            float z = readH3LISAxisDirect(0x2C); // Z-axis
            
            // Simple outlier rejection
            float magnitude = sqrt(x*x + y*y + z*z);
            if (magnitude > 0.5 && magnitude < 1.5) { // Relaxed bounds
                samples[0][validSamples] = x;
                samples[1][validSamples] = y;
                samples[2][validSamples] = z;
                validSamples++;
            }
            
            delay(20);
            
            if (i % 50 == 0) {
                Serial.print(".");
            }
        }
        Serial.println();
        
        if (validSamples < ENHANCED_CALIBRATION_SAMPLES * 0.7) { // Relaxed threshold
            Serial.println("Too many outliers detected! Calibration failed.");
            return false;
        }
        
        // Calculate average for this position
        for (int axis = 0; axis < 3; axis++) {
            float sum = 0;
            for (int i = 0; i < validSamples; i++) {
                sum += samples[axis][i];
            }
            accSum[pos][axis] = sum / validSamples;
        }
        
        Serial.print("Position ");
        Serial.print(pos + 1);
        Serial.print(" complete: ");
        Serial.print(accSum[pos][0], 4);
        Serial.print(", ");
        Serial.print(accSum[pos][1], 4);
        Serial.print(", ");
        Serial.println(accSum[pos][2], 4);
        
        delay(1000);
    }
    
    // Calculate calibration parameters
    Serial.println("Calculating calibration parameters...");
    
    // Calculate offsets (bias)
    h3lisCalibration.offsetX = (accSum[2][0] + accSum[3][0]) / 2.0;
    h3lisCalibration.offsetY = (accSum[4][1] + accSum[5][1]) / 2.0;
    h3lisCalibration.offsetZ = (accSum[0][2] + accSum[1][2]) / 2.0;
    
    // Calculate scale factors
    h3lisCalibration.scaleX = 2.0 / (accSum[2][0] - accSum[3][0]);
    h3lisCalibration.scaleY = 2.0 / (accSum[4][1] - accSum[5][1]);
    h3lisCalibration.scaleZ = 2.0 / (accSum[0][2] - accSum[1][2]);
    
    // Validate calibration quality
    float totalError = 0;
    for (int pos = 0; pos < 6; pos++) {
        float correctedX = (accSum[pos][0] - h3lisCalibration.offsetX) * h3lisCalibration.scaleX;
        float correctedY = (accSum[pos][1] - h3lisCalibration.offsetY) * h3lisCalibration.scaleY;
        float correctedZ = (accSum[pos][2] - h3lisCalibration.offsetZ) * h3lisCalibration.scaleZ;
        
        float errorX = correctedX - expectedGravity[pos][0];
        float errorY = correctedY - expectedGravity[pos][1];
        float errorZ = correctedZ - expectedGravity[pos][2];
        
        totalError += sqrt(errorX*errorX + errorY*errorY + errorZ*errorZ);
    }
    
    h3lisCalibration.calibrationQuality = totalError / 6.0;
    h3lisCalibration.calibrationTime = millis();
    h3lisCalibration.isValid = h3lisCalibration.calibrationQuality < MAX_CALIBRATION_ERROR;
    
    Serial.println("Calibration Results:");
    Serial.print("Offsets: ");
    Serial.print(h3lisCalibration.offsetX, 6);
    Serial.print(", ");
    Serial.print(h3lisCalibration.offsetY, 6);
    Serial.print(", ");
    Serial.println(h3lisCalibration.offsetZ, 6);
    
    Serial.print("Scale factors: ");
    Serial.print(h3lisCalibration.scaleX, 6);
    Serial.print(", ");
    Serial.print(h3lisCalibration.scaleY, 6);
    Serial.print(", ");
    Serial.println(h3lisCalibration.scaleZ, 6);
    
    Serial.print("Calibration quality (RMS error): ");
    Serial.print(h3lisCalibration.calibrationQuality, 6);
    Serial.println(" g");
    
    if (h3lisCalibration.isValid) {
        Serial.println("Calibration PASSED!");
        saveH3lisCalibrationAdvanced();
        return true;
    } else {
        Serial.println("Calibration FAILED! Error too high.");
        return false;
    }
}

// **FIXED: Basic calibration with direct register reading**
void calibrateH3lisSensor() {
    float sumX = 0, sumY = 0, sumZ = 0;
    for (int i = 0; i < 100; i++) { // Use defined samples
        // **CHANGED: Use direct register reading**
        sumX += readH3LISAxisDirect(0x28); // X-axis
        sumY += readH3LISAxisDirect(0x2A); // Y-axis
        sumZ += readH3LISAxisDirect(0x2C); // Z-axis
        delay(10);
    }
    
    float offsetX = sumX / 100.0;
    float offsetY = sumY / 100.0;
    float offsetZ = sumZ / 100.0;
    
    Serial.println("Basic calibration offsets:");
    Serial.print("offsetX = "); Serial.println(offsetX, 5);
    Serial.print("offsetY = "); Serial.println(offsetY, 5);
    Serial.print("offsetZ = "); Serial.println(offsetZ, 5);

    // Store in the global calibration structure
    h3lisCalibration.offsetX = offsetX;
    h3lisCalibration.offsetY = offsetY;
    h3lisCalibration.offsetZ = offsetZ;
    h3lisCalibration.scaleX = 1.0;
    h3lisCalibration.scaleY = 1.0;
    h3lisCalibration.scaleZ = 1.0;
    h3lisCalibration.isValid = true;
    
    saveH3lisCalibration();
}

// **FIXED: Apply calibration using direct register reading**
void applyH3lisCalibration(float &x, float &y, float &z) {
    if (h3lisCalibration.isValid) {
        x = (x - h3lisCalibration.offsetX) * h3lisCalibration.scaleX;
        y = (y - h3lisCalibration.offsetY) * h3lisCalibration.scaleY;
        z = (z - h3lisCalibration.offsetZ) * h3lisCalibration.scaleZ;
    }
}

// Keep the rest of your functions (save/load) unchanged
void saveH3lisCalibrationAdvanced() {
    Preferences prefs;
    prefs.begin("h3lis_cal", false);
    
    prefs.putFloat("offsetX", h3lisCalibration.offsetX);
    prefs.putFloat("offsetY", h3lisCalibration.offsetY);
    prefs.putFloat("offsetZ", h3lisCalibration.offsetZ);
    prefs.putFloat("scaleX", h3lisCalibration.scaleX);
    prefs.putFloat("scaleY", h3lisCalibration.scaleY);
    prefs.putFloat("scaleZ", h3lisCalibration.scaleZ);
    prefs.putFloat("quality", h3lisCalibration.calibrationQuality);
    prefs.putULong("calTime", h3lisCalibration.calibrationTime);
    prefs.putBool("isValid", h3lisCalibration.isValid);
    
    prefs.end();
    Serial.println("Enhanced H3LIS200DL calibration saved to flash.");
}

bool loadH3lisCalibrationAdvanced() {
    Preferences prefs;
    prefs.begin("h3lis_cal", true);
    
    if (prefs.isKey("offsetX") && prefs.isKey("scaleX") && prefs.isKey("isValid")) {
        h3lisCalibration.offsetX = prefs.getFloat("offsetX", 0.0);
        h3lisCalibration.offsetY = prefs.getFloat("offsetY", 0.0);
        h3lisCalibration.offsetZ = prefs.getFloat("offsetZ", 0.0);
        h3lisCalibration.scaleX = prefs.getFloat("scaleX", 1.0);
        h3lisCalibration.scaleY = prefs.getFloat("scaleY", 1.0);
        h3lisCalibration.scaleZ = prefs.getFloat("scaleZ", 1.0);
        h3lisCalibration.calibrationQuality = prefs.getFloat("quality", 0.0);
        h3lisCalibration.calibrationTime = prefs.getULong("calTime", 0);
        h3lisCalibration.isValid = prefs.getBool("isValid", false);
        
        prefs.end();
        
        if (h3lisCalibration.isValid) {
            Serial.println("Enhanced H3LIS200DL calibration loaded:");
            Serial.print("Calibration quality: ");
            Serial.println(h3lisCalibration.calibrationQuality, 6);
            return true;
        }
    }
    
    prefs.end();
    Serial.println("No valid H3LIS200DL calibration found.");
    return false;
}

void saveH3lisCalibration() {
    Preferences prefs;
    prefs.begin("h3lis_basic", false);
    prefs.putFloat("offsetX", h3lisCalibration.offsetX);
    prefs.putFloat("offsetY", h3lisCalibration.offsetY);
    prefs.putFloat("offsetZ", h3lisCalibration.offsetZ);
    prefs.end();
    Serial.println("Basic H3LIS200DL calibration saved to flash.");
}

bool loadH3lisCalibration() {
    Preferences prefs;
    prefs.begin("h3lis_basic", true);
    if (prefs.isKey("offsetX") && prefs.isKey("offsetY") && prefs.isKey("offsetZ")) {
        h3lisCalibration.offsetX = prefs.getFloat("offsetX", 0.0);
        h3lisCalibration.offsetY = prefs.getFloat("offsetY", 0.0);
        h3lisCalibration.offsetZ = prefs.getFloat("offsetZ", 0.0);
        h3lisCalibration.scaleX = 1.0;
        h3lisCalibration.scaleY = 1.0;
        h3lisCalibration.scaleZ = 1.0;
        h3lisCalibration.isValid = true;
        
        prefs.end();
        Serial.println("Basic H3LIS200DL calibration loaded from flash:");
        Serial.print("offsetX = "); Serial.println(h3lisCalibration.offsetX, 5);
        Serial.print("offsetY = "); Serial.println(h3lisCalibration.offsetY, 5);
        Serial.print("offsetZ = "); Serial.println(h3lisCalibration.offsetZ, 5);
        return true;
    }
    prefs.end();
    Serial.println("No basic H3LIS200DL calibration found in flash.");
    return false;
}

void clearH3lisCalibration() {
    Preferences prefs;
    prefs.begin("h3lis_cal", false);
    prefs.clear();
    prefs.end();
    
    // Reset calibration structure
    h3lisCalibration = {0};
    h3lisCalibration.isValid = false;
    
    Serial.println("H3LIS200DL calibration data cleared.");
}
// Automatic calibration without user input
bool calibrateH3lisSensorAutomatic() {
    Serial.println("=== Automatic H3LIS200DL Calibration ===");
    Serial.println("Calibrating in helmet installation position...");
    
    // Wait for sensor to settle
    delay(2000);
    
    // Check if sensor is reasonably stable (relaxed threshold)
    float readings[20];
    float sum = 0;
    
    for (int i = 0; i < 20; i++) {
        float x = readH3LISAxisDirect(0x28);
        float y = readH3LISAxisDirect(0x2A);
        float z = readH3LISAxisDirect(0x2C);
        readings[i] = sqrt(x*x + y*y + z*z);
        sum += readings[i];
        delay(50);
    }
    
    float mean = sum / 20;
    float variance = 0;
    for (int i = 0; i < 20; i++) {
        variance += pow(readings[i] - mean, 2);
    }
    float stdDev = sqrt(variance / 20);
    
    Serial.printf("Sensor stability: %.4f (mean: %.3f)\n", stdDev, mean);
    
    // Continue even if not perfectly stable (practical for helmet use)
    if (stdDev > 0.2) {
        Serial.println("Warning: Sensor not perfectly stable, but continuing...");
    }
    
    // Collect calibration data
    Serial.println("Collecting calibration data...");
    
    float sumX = 0, sumY = 0, sumZ = 0;
    int validSamples = 0;
    
    for (int i = 0; i < 500; i++) {
        float x = readH3LISAxisDirect(0x28);
        float y = readH3LISAxisDirect(0x2A);
        float z = readH3LISAxisDirect(0x2C);
        
        float magnitude = sqrt(x*x + y*y + z*z);
        
        // Accept samples with reasonable magnitude
        if (magnitude > 0.3 && magnitude < 2.0) {
            sumX += x;
            sumY += y;
            sumZ += z;
            validSamples++;
        }
        
        delay(10);
        
        if (i % 100 == 0) {
            Serial.print(".");
        }
    }
    Serial.println();
    
    if (validSamples < 300) {
        Serial.println("Not enough valid samples for calibration.");
        return false;
    }
    
    // Calculate offsets
    h3lisCalibration.offsetX = sumX / validSamples;
    h3lisCalibration.offsetY = sumY / validSamples;
    h3lisCalibration.offsetZ = sumZ / validSamples;
    h3lisCalibration.scaleX = 1.0;
    h3lisCalibration.scaleY = 1.0;
    h3lisCalibration.scaleZ = 1.0;
    h3lisCalibration.isValid = true;
    h3lisCalibration.calibrationTime = millis();
    
    // Calculate reference magnitude for quality check
    float refMagnitude = sqrt(h3lisCalibration.offsetX * h3lisCalibration.offsetX + 
                             h3lisCalibration.offsetY * h3lisCalibration.offsetY + 
                             h3lisCalibration.offsetZ * h3lisCalibration.offsetZ);
    
    h3lisCalibration.calibrationQuality = abs(refMagnitude - 1.0);
    
    Serial.println("Automatic Calibration Results:");
    Serial.printf("Offsets: X=%.3f, Y=%.3f, Z=%.3f\n", 
                  h3lisCalibration.offsetX, h3lisCalibration.offsetY, h3lisCalibration.offsetZ);
    Serial.printf("Reference magnitude: %.3f g\n", refMagnitude);
    Serial.printf("Quality score: %.3f\n", h3lisCalibration.calibrationQuality);
    
    saveH3lisCalibration();
    return true;
}

// Fallback default calibration values
void setDefaultH3lisCalibration() {
    Serial.println("Setting default H3LIS200DL calibration values...");
    
    // Use reasonable default values for a tilted helmet sensor
    h3lisCalibration.offsetX = 0.0;
    h3lisCalibration.offsetY = 0.0;
    h3lisCalibration.offsetZ = 0.0;
    h3lisCalibration.scaleX = 1.0;
    h3lisCalibration.scaleY = 1.0;
    h3lisCalibration.scaleZ = 1.0;
    h3lisCalibration.isValid = true;
    h3lisCalibration.calibrationTime = millis();
    h3lisCalibration.calibrationQuality = 1.0; // Mark as default
    
    saveH3lisCalibration();
    Serial.println("Default calibration values set.");
}

// Optional: Manual recalibration via serial command
void checkForRecalibrationCommand() {
    if (Serial.available()) {
        String command = Serial.readString();
        command.trim();
        
        if (command == "recal_h3lis") {
            Serial.println("Manual recalibration requested...");
            clearH3lisCalibration();
            calibrateH3lisSensorAutomatic();
        }
    }
}
