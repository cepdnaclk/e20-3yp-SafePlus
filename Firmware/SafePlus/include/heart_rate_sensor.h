#ifndef HEART_RATE_SENSOR_H
#define HEART_RATE_SENSOR_H

#include <Arduino.h>
#include "MAX30105.h"
#include <Wire.h>

class HeartRateSensor {
private:
    MAX30105 particleSensor;
    
    // **SIMPLIFIED: Basic variables only**
    static const int IR_BUFFER_SIZE = 10;
    static const int BPM_BUFFER_SIZE = 5;
    
    float irBuffer[IR_BUFFER_SIZE];
    float bpmBuffer[BPM_BUFFER_SIZE];
    int irBufferIndex;
    int bpmBufferIndex;
    
    unsigned long lastPeakTime;
    float lastBPM;
    int validBeatCount;
    bool peakDetected;
    float lastIRValue;
    
    // **SIMPLIFIED: Basic calibration**
    float detectionThreshold;
    bool isCalibrated;
    int calibrationCount;
    float calibrationSum;
    byte currentLEDPower;
    
    // **SIMPLIFIED: Helper methods**
    bool quickCalibrate(float irValue);
    float calculateHeartRateFromIR(float irValue);
    bool simpleDetectPeak(float irValue);
    float calculateMovingAverage(float* buffer, int size);
    float calculateVariance(float* buffer, int size, float mean);
    bool detectPeak(long irValue, float average, float variance);
    float smoothBPM(float newBPM);
    
public:
    HeartRateSensor();
    bool begin();
    float getHeartRate();
    float getIRValue();
    float getSignalQuality();
    bool isValidReading();
    bool isHelmetOptimized();
    void reset();
    void calibrate();
};

#endif
