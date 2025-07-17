#ifndef H3LIS_CALIBRATION_H
#define H3LIS_CALIBRATION_H

#include <DFRobot_LIS.h>
#include <Preferences.h>
#include <Arduino.h>

// Enhanced calibration structure
struct H3LISCalibration {
    float offsetX, offsetY, offsetZ;
    float scaleX, scaleY, scaleZ;
    float temperature;
    unsigned long calibrationTime;
    bool isValid;
    float calibrationQuality;
};

// Sensor orientation structure for improved calibration
struct SensorOrientation {
    float tiltAngle;
    float primaryAxis;
    int dominantAxis;  // 0=X, 1=Y, 2=Z
    bool isValid;
};

// Enhanced calibration parameters
#define ENHANCED_CALIBRATION_SAMPLES 500
#define STABILITY_THRESHOLD 0.01f
#define POSITION_HOLD_TIME 3000
#define MAX_CALIBRATION_ERROR 0.1f
#define ORIENTATION_SAMPLES 30
#define TILT_THRESHOLD 0.5f
#define STABILITY_TIMEOUT 30000
#define IMPROVED_BATCH_SIZE 40
#define IMPROVED_BATCHES 5
#define STABILITY_SAMPLES 15

// Global calibration object
extern H3LISCalibration h3lisCalibration;
extern float offsetX, offsetY, offsetZ;
extern const int CALIBRATION_SAMPLES;

// Enhanced function declarations
void clearH3lisCalibration();
void saveH3lisCalibrationAdvanced();
bool loadH3lisCalibrationAdvanced();
void applyH3lisCalibration(float &x, float &y, float &z);

// Improved calibration functions
// bool calibrateHelmetMountedSensorImproved();
// bool calibrateHelmetSinglePosition();
// bool checkHelmetStability();
// bool checkHelmetStabilityImproved();
bool calibrateH3lisSensorAdvanced();
bool loadH3lisCalibrationAdvanced();
void saveH3lisCalibrationAdvanced();  
bool checkSensorStability();        
void calibrateH3lisSensor();
void saveH3lisCalibration();
bool loadH3lisCalibration();
float readH3LISAxisDirect(uint8_t regLow);
#endif
