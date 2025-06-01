#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>

typedef struct {
    int16_t ax, ay, az;
    int16_t gx, gy, gz;
    float latitude, longitude;
    float temperature, humidity;
    float h3lis_ax, h3lis_ay, h3lis_az;
    float gasPPM;
    float altitude;
    int floorLevel;

} SensorData;

void initSensors();
SensorData collectSensorData();
void initHeartRateSensor();
float getHeartRate();

#endif
