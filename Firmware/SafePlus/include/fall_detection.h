#ifndef FALL_DETECTION_H
#define FALL_DETECTION_H

#include <Arduino.h>
#include "sensors.h"

// Rolling gyro data for GyroReDi
struct GyroHistory {
    float gyroHistory[4] = {0, 0, 0, 0};

    void update(float value) {
        gyroHistory[3] = gyroHistory[2];
        gyroHistory[2] = gyroHistory[1];
        gyroHistory[1] = gyroHistory[0];
        gyroHistory[0] = value;
    }

    float getAverage() const {
        return (gyroHistory[0] + gyroHistory[1] + gyroHistory[2] + gyroHistory[3]) / 4.0;
    }
};

// NEW: Rolling acceleration data for post-fall inactivity detection
struct AccelHistory {
    float accHistory[10] = {0};  // ~1 second if sampling at 10Hz
    int index = 0;

    void update(float value) {
        accHistory[index] = value;
        index = (index + 1) % 10;
    }

    float getAverage() const {
        float sum = 0;
        for (int i = 0; i < 10; ++i) sum += accHistory[i];
        return sum / 10.0;
    }
};

// Main fall detection logic (updated signature to include AccelHistory)
bool detectFall(const SensorData& data, GyroHistory& gyroHist, AccelHistory& accHist);
String detectImpactWithH3LIS(float ax, float ay, float az);

#endif
