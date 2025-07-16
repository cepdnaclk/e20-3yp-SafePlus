#include "MPU6050Calibration.h"
#include <Arduino.h>
#include <Preferences.h>
#include <MPU6050.h>

#define CALIBRATION_SAMPLES 1000
#define STABILITY_THRESHOLD 100  // ADC units
#define STABILITY_CHECKS 50

void loadMPUCalibration() {
    Preferences prefs;
    prefs.begin("mpu6050", false);
    mpuOffsets.accX = prefs.getInt("accX", 0);
    mpuOffsets.accY = prefs.getInt("accY", 0);
    mpuOffsets.accZ = prefs.getInt("accZ", 0);
    mpuOffsets.gyroX = prefs.getInt("gyroX", 0);
    mpuOffsets.gyroY = prefs.getInt("gyroY", 0);
    mpuOffsets.gyroZ = prefs.getInt("gyroZ", 0);
    mpuOffsets.gravityX = prefs.getFloat("gravX", 0.0);
    mpuOffsets.gravityY = prefs.getFloat("gravY", 0.0);
    mpuOffsets.gravityZ = prefs.getFloat("gravZ", 1.0);
    mpuOffsets.isValid = prefs.getBool("isValid", false);
    mpuOffsets.calibrationTime = prefs.getULong("calTime", 0);
    prefs.end();
    
    if (mpuOffsets.isValid) {
        Serial.println("✅ MPU6050 tilted sensor calibration loaded from flash");
        Serial.printf("Acc offsets: %d, %d, %d\n", mpuOffsets.accX, mpuOffsets.accY, mpuOffsets.accZ);
        Serial.printf("Gyro offsets: %d, %d, %d\n", mpuOffsets.gyroX, mpuOffsets.gyroY, mpuOffsets.gyroZ);
        Serial.printf("Gravity vector: %.3f, %.3f, %.3f\n", mpuOffsets.gravityX, mpuOffsets.gravityY, mpuOffsets.gravityZ);
    } else {
        Serial.println("❌ No valid MPU6050 calibration found");
    }
}

void clearMPUCalibration() {
    Preferences prefs;
    prefs.begin("mpu6050", false);
    prefs.clear();
    prefs.end();
    mpuOffsets = {0};
    mpuOffsets.isValid = false;
    Serial.println("MPU6050 calibration data cleared.");
}

bool checkMPUStability() {
    Serial.println("Checking sensor stability...");
    
    int16_t readings[6][STABILITY_CHECKS];
    int16_t ax, ay, az, gx, gy, gz;
    
    // Collect readings
    for (int i = 0; i < STABILITY_CHECKS; i++) {
        mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
        readings[0][i] = ax;
        readings[1][i] = ay;
        readings[2][i] = az;
        readings[3][i] = gx;
        readings[4][i] = gy;
        readings[5][i] = gz;
        delay(20);
    }
    
    // Check stability for each axis
    const char* axisNames[] = {"AccX", "AccY", "AccZ", "GyroX", "GyroY", "GyroZ"};
    bool stable = true;
    
    for (int axis = 0; axis < 6; axis++) {
        int32_t sum = 0;
        for (int i = 0; i < STABILITY_CHECKS; i++) {
            sum += readings[axis][i];
        }
        float mean = sum / (float)STABILITY_CHECKS;
        
        float variance = 0;
        for (int i = 0; i < STABILITY_CHECKS; i++) {
            variance += pow(readings[axis][i] - mean, 2);
        }
        float stdDev = sqrt(variance / STABILITY_CHECKS);
        
        Serial.printf("%s: stddev=%.1f ", axisNames[axis], stdDev);
        
        if (stdDev > STABILITY_THRESHOLD) {
            Serial.println("❌ UNSTABLE");
            stable = false;
        } else {
            Serial.println("✅ STABLE");
        }
    }
    
    return stable;
}

bool calibrateMPUTiltedSensor() {
    Serial.println("=== MPU6050 Tilted Sensor Calibration ===");
    Serial.println("Place helmet in normal upright position (as worn).");
    Serial.println("Keep completely still during calibration.");
    
    delay(3000);
    
    // Check stability first
    if (!checkMPUStability()) {
        Serial.println("❌ Sensor not stable! Ensure no vibration and try again.");
        return false;
    }
    
    Serial.println("Starting calibration with 1000 samples...");
    
    int64_t sumAX = 0, sumAY = 0, sumAZ = 0;
    int64_t sumGX = 0, sumGY = 0, sumGZ = 0;
    
    Serial.print("Progress: ");
    for (int i = 0; i < CALIBRATION_SAMPLES; i++) {
        int16_t ax, ay, az, gx, gy, gz;
        mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
        
        sumAX += ax;
        sumAY += ay;
        sumAZ += az;
        sumGX += gx;
        sumGY += gy;
        sumGZ += gz;
        
        if (i % 100 == 0) {
            Serial.print(".");
        }
        
        delay(5);
    }
    Serial.println();
    
    // Calculate average readings
    int16_t avgAX = sumAX / CALIBRATION_SAMPLES;
    int16_t avgAY = sumAY / CALIBRATION_SAMPLES;
    int16_t avgAZ = sumAZ / CALIBRATION_SAMPLES;
    
    // For gyroscope, average = offset (should be 0 when stationary)
    mpuOffsets.gyroX = sumGX / CALIBRATION_SAMPLES;
    mpuOffsets.gyroY = sumGY / CALIBRATION_SAMPLES;
    mpuOffsets.gyroZ = sumGZ / CALIBRATION_SAMPLES;
    
    // Store gravity vector in sensor coordinates
    mpuOffsets.gravityX = avgAX / 16384.0;
    mpuOffsets.gravityY = avgAY / 16384.0;
    mpuOffsets.gravityZ = avgAZ / 16384.0;
    
    // For accelerometer, we'll subtract gravity in applyMPUOffsets
    mpuOffsets.accX = 0;
    mpuOffsets.accY = 0;
    mpuOffsets.accZ = 0;
    
    mpuOffsets.isValid = true;
    mpuOffsets.calibrationTime = millis();
    
    // Save to flash
    Preferences prefs;
    prefs.begin("mpu6050", false);
    prefs.putInt("accX", mpuOffsets.accX);
    prefs.putInt("accY", mpuOffsets.accY);
    prefs.putInt("accZ", mpuOffsets.accZ);
    prefs.putInt("gyroX", mpuOffsets.gyroX);
    prefs.putInt("gyroY", mpuOffsets.gyroY);
    prefs.putInt("gyroZ", mpuOffsets.gyroZ);
    prefs.putFloat("gravX", mpuOffsets.gravityX);
    prefs.putFloat("gravY", mpuOffsets.gravityY);
    prefs.putFloat("gravZ", mpuOffsets.gravityZ);
    prefs.putBool("isValid", mpuOffsets.isValid);
    prefs.putULong("calTime", mpuOffsets.calibrationTime);
    prefs.end();
    
    Serial.println("✅ MPU6050 Tilted Sensor Calibration Complete!");
    Serial.printf("Gyro offsets: %d, %d, %d\n", mpuOffsets.gyroX, mpuOffsets.gyroY, mpuOffsets.gyroZ);
    Serial.printf("Gravity vector: %.3f, %.3f, %.3f\n", mpuOffsets.gravityX, mpuOffsets.gravityY, mpuOffsets.gravityZ);
    
    return true;
}

void applyMPUOffsets(int16_t &ax, int16_t &ay, int16_t &az, int16_t &gx, int16_t &gy, int16_t &gz) {
    if (mpuOffsets.isValid) {
        // Apply gyroscope offsets
        gx -= mpuOffsets.gyroX;
        gy -= mpuOffsets.gyroY;
        gz -= mpuOffsets.gyroZ;
        
        // Subtract gravity vector to get motion component
        ax -= (mpuOffsets.gravityX * 16384.0);
        ay -= (mpuOffsets.gravityY * 16384.0);
        az -= (mpuOffsets.gravityZ * 16384.0);
    }
}

void testMPUCalibration() {
    Serial.println("=== Testing MPU6050 Calibration ===");
    Serial.println("Move helmet and observe readings:");
    
    for (int i = 0; i < 30; i++) {
        int16_t ax, ay, az, gx, gy, gz;
        mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
        
        Serial.print("Raw: ");
        Serial.printf("A(%d,%d,%d) G(%d,%d,%d) | ", ax, ay, az, gx, gy, gz);
        
        // Apply calibration
        applyMPUOffsets(ax, ay, az, gx, gy, gz);
        
        Serial.print("Cal: ");
        Serial.printf("A(%d,%d,%d) G(%d,%d,%d)", ax, ay, az, gx, gy, gz);
        
        // Calculate motion magnitude
        float motionMag = sqrt(pow(ax/16384.0, 2) + pow(ay/16384.0, 2) + pow(az/16384.0, 2));
        Serial.printf(" Motion=%.3fg", motionMag);
        
        Serial.println();
        delay(200);
    }
}

// Backward compatibility
bool calibrateMPU() {
    return calibrateMPUTiltedSensor();
}
