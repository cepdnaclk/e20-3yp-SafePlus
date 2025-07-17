#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>

// Enhanced sensor data structure with comprehensive validation flags
struct SensorData {
    // MPU6050 data
    int16_t ax, ay, az;
    int16_t gx, gy, gz;
    bool mpuValid;
    
    // H3LIS200DL data
    float h3lis_ax, h3lis_ay, h3lis_az;
    bool h3lisValid;
    
    // GPS data
    double latitude, longitude;  // Changed to double for better precision
    bool gpsValid;
    
    // Environmental data
    float temperature, humidity;
    float altitude;
    int floorLevel;
    bool environmentalValid;
    
    // Gas detection
    float gasPPM;
    String gasType;
    bool gasValid;
    
    // Heart rate
    float heartRate;
    bool heartRateValid;
    
    // Timestamp
    unsigned long timestamp;
    
    // Constructor for proper initialization
    SensorData() : ax(0), ay(0), az(0), gx(0), gy(0), gz(0), 
                   h3lis_ax(0), h3lis_ay(0), h3lis_az(0),
                   latitude(0.0), longitude(0.0),
                   temperature(0.0), humidity(0.0), altitude(0.0),
                   floorLevel(0), gasPPM(0.0), heartRate(0.0),
                   mpuValid(false), h3lisValid(false), gpsValid(false),
                   environmentalValid(false), gasValid(false), 
                   heartRateValid(false), timestamp(0) {}
};

// // Enhanced function declarations
// bool initSensorsImproved();
// SensorData collectSensorDataEnhanced();

// // Enhanced sensor initialization functions
// bool initMPU6050Enhanced();
// bool initH3LISEnhanced();
// void initGPS();
// bool initBMP280Enhanced();
// bool initDHT22Enhanced();
// bool initMQ2Enhanced();
// bool initHeartRateEnhanced();

// // Enhanced data reading functions
// bool readMPU6050Data(SensorData &data);
// bool readH3LISData(SensorData &data);
// void readGPSData(SensorData &data);
// void readEnvironmentalData(SensorData &data);
// float getHeartRateEnhanced();

// // Sensor health and status functions
// void printSensorStatus();
// void checkSensorHealth();
// // Add this declaration to sensors.h
// void handleGasDetection(SensorData &data);

// Environmental sensor functions
void updateReferenceAltitude();

// Heart rate functions
float HeartRateFromIR();

// Command handling
void handleIncomingCommand(String payload);

// Backward compatibility wrappers
void initSensors();
SensorData collectSensorData();
void initHeartRateSensor();
float getHeartRate();

#endif
