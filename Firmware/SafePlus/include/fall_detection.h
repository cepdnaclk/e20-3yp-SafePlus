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
        gyroHistory[1] = value;
    }
    float getAverage() {
        return (gyroHistory[1] + gyroHistory[2] + gyroHistory[3]) / 3.0;
    }
};

// Main fall detection logic
bool detectFall(const SensorData& data, GyroHistory& gyroHist);

#endif
