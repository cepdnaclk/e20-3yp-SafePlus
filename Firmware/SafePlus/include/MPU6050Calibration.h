#ifndef MPU6050_CALIBRATION_H
#define MPU6050_CALIBRATION_H

#include <Arduino.h>
#include <Preferences.h>
#include <MPU6050.h>
#include <stdint.h>

// Enhanced calibration structure for tilted sensor
struct MPUOffsets {
    int16_t accX, accY, accZ;
    int16_t gyroX, gyroY, gyroZ;
    float gravityX, gravityY, gravityZ;  // Gravity vector in sensor frame
    bool isValid;
    unsigned long calibrationTime;
};

// External variables (declared in sensors.cpp)
extern MPU6050 mpu;
extern Preferences preferences;
extern MPUOffsets mpuOffsets;

// Function declarations ONLY (no implementations)
void clearMPUCalibration();
bool calibrateMPUTiltedSensor();
bool calibrateMPU();
void loadMPUCalibration();
void applyMPUOffsets(int16_t &ax, int16_t &ay, int16_t &az, int16_t &gx, int16_t &gy, int16_t &gz);
bool checkMPUStability();
void testMPUCalibration();
bool calibrateH3lisSensorAutomatic();
void setDefaultH3lisCalibration();
void checkForRecalibrationCommand();

#endif
