#ifndef MPU6050_CALIBRATION_H
#define MPU6050_CALIBRATION_H

#include <Wire.h>
#include <MPU6050.h>
#include <Preferences.h>

extern Preferences preferences;
extern MPU6050 mpu;

struct MPUOffsets {
    int16_t accX, accY, accZ;
    int16_t gyroX, gyroY, gyroZ;
};

void calibrateMPU();
void loadMPUCalibration();
void applyMPUOffsets(int16_t &ax, int16_t &ay, int16_t &az, int16_t &gx, int16_t &gy, int16_t &gz);

#endif
