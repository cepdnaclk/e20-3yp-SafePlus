#include "MQ2Calibration.h"

// Gas detection curves [log10(ppm), slope, intercept]
float LPGCurve[3]   = {2.3, 0.21, -0.47};
float COCurve[3]    = {2.3, 0.72, -0.34};
float SmokeCurve[3] = {2.3, 0.53, -0.44};

// Global calibration object
MQ2Calibration mq2Calibration = {0};

// State management
bool mq2IsPowered = false;
unsigned long mq2LastPowerOnTime = 0;
unsigned long lastMotionDetectedTime = 0;
float mq2LatestGasPPM = 0.0;
String mq2LatestGasType = "Safe";

bool initMQ2Sensor() {
    pinMode(MQ2_POWER_PIN, OUTPUT);
    digitalWrite(MQ2_POWER_PIN, LOW); // Power OFF initially
    
    Serial.println("=== MQ2 Gas Sensor Initialization ===");
    
    // Load existing calibration
    loadMQ2Calibration();
    
    if (!mq2Calibration.isValid) {
        Serial.println("No valid MQ2 calibration found. Starting calibration...");
        
        if (calibrateMQ2Advanced()) {
            Serial.println("✅ MQ2 advanced calibration completed successfully!");
        } else {
            Serial.println("⚠️ Advanced calibration failed, trying basic calibration...");
            if (calibrateMQ2Basic()) {
                Serial.println("✅ MQ2 basic calibration completed!");
            } else {
                Serial.println("❌ All calibration methods failed, using default values.");
                setDefaultMQ2Calibration();
            }
        }
    } else {
        Serial.println("✅ MQ2 calibration loaded from flash.");
        Serial.printf("R0 = %.2f, Quality = %.3f\n", mq2Calibration.R0, mq2Calibration.calibrationQuality);
    }
    
    return mq2Calibration.isValid;
}

float getSensorResistanceRaw() {
    long sum = 0;
    const int samples = 10;
    
    for (int i = 0; i < samples; i++) {
        int adcValue = analogRead(MQ2_PIN);
        adcValue = max(adcValue, 1); // Prevent division by zero
        sum += adcValue;
        delay(10);
    }
    
    float avgAdc = sum / (float)samples;
    float vout = (avgAdc * VCC) / ADC_RESOLUTION;
    float rs = ((VCC - vout) * RL_VALUE) / vout;
    
    return rs;
}

float getSensorResistanceFiltered() {
    const int samples = 5;
    float readings[samples];
    
    // Collect samples
    for (int i = 0; i < samples; i++) {
        readings[i] = getSensorResistanceRaw();
        delay(100);
    }
    
    // Simple median filter
    for (int i = 0; i < samples - 1; i++) {
        for (int j = i + 1; j < samples; j++) {
            if (readings[i] > readings[j]) {
                float temp = readings[i];
                readings[i] = readings[j];
                readings[j] = temp;
            }
        }
    }
    
    return readings[samples / 2]; // Return median
}

bool checkMQ2Stability() {
    Serial.println("Checking MQ2 sensor stability...");
    
    float readings[20];
    float sum = 0;
    
    for (int i = 0; i < 20; i++) {
        readings[i] = getSensorResistanceRaw();
        sum += readings[i];
        delay(500);
    }
    
    float mean = sum / 20;
    float variance = 0;
    
    for (int i = 0; i < 20; i++) {
        variance += pow(readings[i] - mean, 2);
    }
    
    float stdDev = sqrt(variance / 20);
    float stability = stdDev / mean; // Coefficient of variation
    
    Serial.printf("MQ2 Stability: Mean=%.2f, StdDev=%.2f, CV=%.3f\n", mean, stdDev, stability);
    
    return stability < 0.05; // 5% variation threshold
}

bool calibrateMQ2Advanced() {
    Serial.println("=== Advanced MQ2 Calibration ===");
    Serial.println("Please ensure the sensor is in clean air environment.");
    Serial.println("Keep area well-ventilated and away from gas sources.");
    
    // Power on sensor for warm-up
    digitalWrite(MQ2_POWER_PIN, LOW);
    mq2IsPowered = true;
    mq2LastPowerOnTime = millis();
    
    Serial.println("Warming up sensor for 60 seconds...");
    Serial.print("Progress: ");
    
    for (int i = 0; i < 60; i++) {
        if (i % 5 == 0) Serial.print(".");
        delay(1000);
    }
    Serial.println();
    
    // Check stability
    if (!checkMQ2Stability()) {
        Serial.println("❌ Sensor not stable enough for calibration!");
        digitalWrite(MQ2_POWER_PIN, HIGH);
        mq2IsPowered = false;
        return false;
    }
    
    // Collect calibration data
    Serial.println("Collecting calibration samples...");
    
    float sumR0 = 0;
    float readings[MQ2_CALIBRATION_SAMPLES];
    int validSamples = 0;
    
    for (int i = 0; i < MQ2_CALIBRATION_SAMPLES; i++) {
        float rs = getSensorResistanceFiltered();
        
        // Validate reading
        if (rs > 1.0 && rs < 1000.0) {
            readings[validSamples] = rs;
            sumR0 += rs;
            validSamples++;
        }
        
        delay(200);
        
        if (i % 10 == 0) Serial.print(".");
    }
    Serial.println();
    
    if (validSamples < MQ2_CALIBRATION_SAMPLES * 0.8) {
        Serial.println("❌ Not enough valid samples for calibration!");
        digitalWrite(MQ2_POWER_PIN, HIGH);
        mq2IsPowered = false;
        return false;
    }
    
    // Calculate R0 and quality metrics
    float avgR0 = sumR0 / validSamples;
    mq2Calibration.R0 = avgR0 / MQ2_CLEAN_AIR_FACTOR;
    
    // Calculate calibration quality (coefficient of variation)
    float variance = 0;
    for (int i = 0; i < validSamples; i++) {
        variance += pow(readings[i] - avgR0, 2);
    }
    float stdDev = sqrt(variance / validSamples);
    mq2Calibration.calibrationQuality = stdDev / avgR0;
    
    // Store calibration data
    mq2Calibration.cleanAirRatio = avgR0;
    mq2Calibration.isValid = true;
    mq2Calibration.calibrationTime = millis();
    mq2Calibration.ambientTemp = 25.0; // Default values
    mq2Calibration.ambientHumidity = 50.0;
    
    Serial.println("✅ Advanced MQ2 Calibration Results:");
    Serial.printf("R0 = %.2f kΩ\n", mq2Calibration.R0);
    Serial.printf("Clean air ratio = %.2f\n", mq2Calibration.cleanAirRatio);
    Serial.printf("Quality (CV) = %.3f\n", mq2Calibration.calibrationQuality);
    
    // Power off sensor
    digitalWrite(MQ2_POWER_PIN, HIGH);
    mq2IsPowered = false;
    
    saveMQ2Calibration();
    return true;
}

bool calibrateMQ2Basic() {
    Serial.println("=== Basic MQ2 Calibration ===");
    
    // Power on sensor
    digitalWrite(MQ2_POWER_PIN, LOW);
    mq2IsPowered = true;
    mq2LastPowerOnTime = millis();
    
    // Shorter warm-up for basic calibration
    Serial.println("Basic warm-up for 30 seconds...");
    delay(30000);
    
    // Simple calibration
    float sumR0 = 0;
    const int samples = 50;
    
    for (int i = 0; i < samples; i++) {
        sumR0 += getSensorResistanceRaw();
        delay(100);
    }
    
    mq2Calibration.R0 = (sumR0 / samples) / MQ2_CLEAN_AIR_FACTOR;
    mq2Calibration.cleanAirRatio = sumR0 / samples;
    mq2Calibration.isValid = true;
    mq2Calibration.calibrationTime = millis();
    mq2Calibration.calibrationQuality = 0.5; // Mark as basic calibration
    
    Serial.printf("Basic calibration R0 = %.2f kΩ\n", mq2Calibration.R0);
    
    // Power off sensor
    digitalWrite(MQ2_POWER_PIN, HIGH);
    mq2IsPowered = false;
    
    saveMQ2Calibration();
    return true;
}

void setDefaultMQ2Calibration() {
    Serial.println("Setting default MQ2 calibration values...");
    
    mq2Calibration.R0 = 10.0; // Default R0 value
    mq2Calibration.cleanAirRatio = 98.3;
    mq2Calibration.isValid = true;
    mq2Calibration.calibrationTime = millis();
    mq2Calibration.calibrationQuality = 1.0; // Mark as default
    
    saveMQ2Calibration();
}

void loadMQ2Calibration() {
    Preferences prefs;
    prefs.begin("mq2_cal", true);
    
    if (prefs.isKey("R0") && prefs.isKey("isValid")) {
        mq2Calibration.R0 = prefs.getFloat("R0", 10.0);
        mq2Calibration.cleanAirRatio = prefs.getFloat("cleanAir", 98.3);
        mq2Calibration.isValid = prefs.getBool("isValid", false);
        mq2Calibration.calibrationTime = prefs.getULong("calTime", 0);
        mq2Calibration.calibrationQuality = prefs.getFloat("quality", 1.0);
        mq2Calibration.ambientTemp = prefs.getFloat("temp", 25.0);
        mq2Calibration.ambientHumidity = prefs.getFloat("humidity", 50.0);
        
        Serial.println("✅ MQ2 calibration loaded from flash");
    } else {
        Serial.println("❌ No MQ2 calibration found in flash");
        mq2Calibration.isValid = false;
    }
    
    prefs.end();
}

void saveMQ2Calibration() {
    Preferences prefs;
    prefs.begin("mq2_cal", false);
    
    prefs.putFloat("R0", mq2Calibration.R0);
    prefs.putFloat("cleanAir", mq2Calibration.cleanAirRatio);
    prefs.putBool("isValid", mq2Calibration.isValid);
    prefs.putULong("calTime", mq2Calibration.calibrationTime);
    prefs.putFloat("quality", mq2Calibration.calibrationQuality);
    prefs.putFloat("temp", mq2Calibration.ambientTemp);
    prefs.putFloat("humidity", mq2Calibration.ambientHumidity);
    
    prefs.end();
    Serial.println("✅ MQ2 calibration saved to flash");
}

void clearMQ2Calibration() {
    Preferences prefs;
    prefs.begin("mq2_cal", false);
    prefs.clear();
    prefs.end();
    
    mq2Calibration = {0};
    mq2Calibration.isValid = false;
    Serial.println("MQ2 calibration cleared");
}

float getGasPPM(float ratio, float *curve) {
    return pow(10, ((log10(ratio) - curve[1]) / curve[2]) + curve[0]);
}

String detectGasType(float lpgPPM, float coPPM, float smokePPM) {
    float maxPPM = max(lpgPPM, max(coPPM, smokePPM));
    
    if (maxPPM == lpgPPM && lpgPPM > 100.0) {
        return "LPG";
    } else if (maxPPM == coPPM && coPPM > 35.0) {
        return "CO";
    } else if (maxPPM == smokePPM && smokePPM > 300.0) {
        return "Smoke";
    }
    
    return "Safe";
}

void updateMQ2Power(bool motionDetected) {
    unsigned long now = millis();
    
    if (motionDetected) {
        lastMotionDetectedTime = now;
        
        if (!mq2IsPowered) {
            digitalWrite(MQ2_POWER_PIN, LOW);
            mq2IsPowered = true;
            mq2LastPowerOnTime = now;
            Serial.println("MQ2 powered ON (motion detected)");
        }
    }
    
    // Turn off MQ2 only if 2 minutes passed since last motion
    if (mq2IsPowered && (now - lastMotionDetectedTime > MQ2_MIN_ON_DURATION)) {
        digitalWrite(MQ2_POWER_PIN, HIGH);
        mq2IsPowered = false;
        Serial.println("MQ2 powered OFF (no motion)");
    }
}

bool processMQ2Reading(float &gasPPM, String &gasType) {
    unsigned long now = millis();
    if (mq2IsPowered) {
        if (now - mq2LastPowerOnTime >= MQ2_WARMUP_TIME) {
            // Sensor is warmed up, take reading
            float rs = getSensorResistanceFiltered();
            float ratio = rs / mq2Calibration.R0;
            
            // Calculate gas concentrations
            float lpgPPM = getGasPPM(ratio, LPGCurve);
            float coPPM = getGasPPM(ratio, COCurve);
            float smokePPM = getGasPPM(ratio, SmokeCurve);
            
            // Determine gas type and concentration
            gasType = detectGasType(lpgPPM, coPPM, smokePPM);
            gasPPM = max(lpgPPM, max(coPPM, smokePPM));
            
            // Store latest readings
            mq2LatestGasPPM = gasPPM;
            mq2LatestGasType = gasType;
            
            return true; // **CHANGED: Return true for valid reading**
        } else {
            // Still warming up
            gasType = "Warming";
            gasPPM = 0.0;
            return false; // **CHANGED: Return false during warmup**
        }
    } else {
        // Sensor powered off
        gasType = "No Motion";
        gasPPM = 0.0;
        return false; // **CHANGED: Return false when powered off**
    }
}


void testMQ2Sensor() {
    Serial.println("=== MQ2 Sensor Test ===");
    
    // Power on sensor
    digitalWrite(MQ2_POWER_PIN, LOW);
    mq2IsPowered = true;
    
    Serial.println("Warming up for 30 seconds...");
    delay(30000);
    
    for (int i = 0; i < 20; i++) {
        float rs = getSensorResistanceFiltered();
        float ratio = rs / mq2Calibration.R0;
        
        float lpgPPM = getGasPPM(ratio, LPGCurve);
        float coPPM = getGasPPM(ratio, COCurve);
        float smokePPM = getGasPPM(ratio, SmokeCurve);
        
        String gasType = detectGasType(lpgPPM, coPPM, smokePPM);
        float maxPPM = max(lpgPPM, max(coPPM, smokePPM));
        
        Serial.printf("Rs=%.2f, Ratio=%.2f, LPG=%.1f, CO=%.1f, Smoke=%.1f, Type=%s\n",
                      rs, ratio, lpgPPM, coPPM, smokePPM, gasType.c_str());
        
        delay(1000);
    }
    
    // Power off sensor
    digitalWrite(MQ2_POWER_PIN, HIGH);
    mq2IsPowered = false;
}
