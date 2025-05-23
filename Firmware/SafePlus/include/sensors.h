#ifndef SENSOR_H
#define SENSOR_H

#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <MPU6050.h>
#include <HardwareSerial.h>
#include <TinyGPSPlus.h>

// Sensor Pin Definitions
#define DHTPIN 4
#define DHTTYPE DHT22
#define RXD2 16
#define TXD2 17
#define GPS_BAUD 9600
#define MQ2_PIN 34

struct SensorData {
    float temperature;
    float humidity;
    int16_t ax, ay, az, gx, gy, gz;
    double latitude, longitude;
    float gasPPM;
};
// Function declarations
void initSensors();
SensorData collectSensorData();
void initHeartRateSensor();
float getHeartRate();


#endif 
