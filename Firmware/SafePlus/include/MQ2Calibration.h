#ifndef MQ2_CALIBRATION_H
#define MQ2_CALIBRATION_H

#include <Arduino.h>
#include <Preferences.h>

// MQ2 Configuration
#define MQ2_PIN            34
#define MQ2_POWER_PIN      26
#define RL_VALUE           9.7
#define VCC                5.0
#define ADC_RESOLUTION     4095.0

// Calibration parameters
#define MQ2_CALIBRATION_SAMPLES 100
#define MQ2_WARMUP_TIME 30000UL
#define MQ2_STABILIZATION_TIME 60000UL
#define MQ2_MIN_ON_DURATION 2 * 60 * 1000UL
#define MQ2_CLEAN_AIR_FACTOR 9.83

// MQ2 Calibration Structure
struct MQ2Calibration {
    float R0;
    float cleanAirRatio;
    bool isValid;
    unsigned long calibrationTime;
    float calibrationQuality;
    float ambientTemp;
    float ambientHumidity;
};

// Gas detection curves [log10(ppm), slope, intercept]
extern float LPGCurve[3];
extern float COCurve[3];
extern float SmokeCurve[3];

// Global calibration object
extern MQ2Calibration mq2Calibration;

// State management
extern bool mq2IsPowered;
extern unsigned long mq2LastPowerOnTime;
extern unsigned long lastMotionDetectedTime;
extern float mq2LatestGasPPM;
extern String mq2LatestGasType;

// Main initialization function
bool initMQ2Sensor();

// Sensor reading functions
float getSensorResistanceRaw();
float getSensorResistanceFiltered();

// Calibration functions
bool calibrateMQ2Advanced();
bool calibrateMQ2Basic();
void setDefaultMQ2Calibration();  // ADD THIS LINE
void loadMQ2Calibration();
void saveMQ2Calibration();
void clearMQ2Calibration();

// Gas detection functions
float getGasPPM(float ratio, float *curve);
String detectGasType(float lpgPPM, float coPPM, float smokePPM);
void updateMQ2Power(bool motionDetected);       // ADD THIS LINE
bool processMQ2Reading(float &gasPPM, String &gasType);

// Utility functions
bool checkMQ2Stability();
float getAmbientCorrection(float temp, float humidity);
void testMQ2Sensor();

#endif
