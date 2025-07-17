#ifndef FALL_DETECTION_H
#define FALL_DETECTION_H

#include <Arduino.h>
#include "sensors.h"

// Memory-optimized rolling data structures for ESP32
struct GyroHistory {
    float gyroHistory[6] = {0};  // Increased for better stability
    int index = 0;

    void update(float value) {
        gyroHistory[index] = value;
        index = (index + 1) % 6;
    }

    float getAverage() const {
        float sum = 0;
        for (int i = 0; i < 6; i++) sum += gyroHistory[i];
        return sum / 6.0;
    }

    float getVariance() const {
        float avg = getAverage();
        float variance = 0;
        for (int i = 0; i < 6; i++) {
            variance += pow(gyroHistory[i] - avg, 2);
        }
        return variance / 6.0;
    }
};

struct AccelHistory {
    float accHistory[12] = {0};  // ~1.2 seconds at 10Hz
    int index = 0;

    void update(float value) {
        accHistory[index] = value;
        index = (index + 1) % 12;
    }

    float getAverage() const {
        float sum = 0;
        for (int i = 0; i < 12; i++) sum += accHistory[i];
        return sum / 12.0;
    }

    float getStdDev() const {
        float avg = getAverage();
        float variance = 0;
        for (int i = 0; i < 12; i++) {
            variance += pow(accHistory[i] - avg, 2);
        }
        return sqrt(variance / 12.0);
    }
};

// Adaptive thresholds based on research (Bourke et al., 2010)
struct AdaptiveThresholds {
    float agvesrBase = 18.0;
    float alimBase = 3.2;
    float gyroBase = 95.0;
    float accPeakBase = 2.8;
    float learningRate = 0.005;  // Slow adaptation for stability
    int calibrationSamples = 0;
    static const int CALIBRATION_PERIOD = 500;  // 50 seconds at 10Hz

    void updateBaseline(float agvesr, float alim, float gyro, float accPeak) {
        if (calibrationSamples < CALIBRATION_PERIOD) {
            calibrationSamples++;
            agvesrBase = agvesrBase * (1 - learningRate) + agvesr * learningRate;
            alimBase = alimBase * (1 - learningRate) + alim * learningRate;
            gyroBase = gyroBase * (1 - learningRate) + gyro * learningRate;
            accPeakBase = accPeakBase * (1 - learningRate) + accPeak * learningRate;
        }
    }

    float getAGVeSRThreshold() const { return agvesrBase * 1.8; }
    float getALIMThreshold() const { return alimBase * 1.6; }
    float getGyroThreshold() const { return gyroBase * 1.3; }
    float getAccPeakThreshold() const { return accPeakBase * 1.4; }
};

// Multi-stage fall detection state machine
enum FallStage {
    NORMAL,
    PRE_FALL,
    FALL_DETECTED,
    POST_FALL_ANALYSIS
};

struct FallStateMachine {
    FallStage currentStage = NORMAL;
    unsigned long stageStartTime = 0;
    int confirmationCounter = 0;
    int falseAlarmCounter = 0;
    static const int MAX_FALSE_ALARMS = 3;

    bool processFallDetection(bool fallIndicators[10], float impactConfidence);
    void reset();
};

// Enhanced impact analysis structure
struct ImpactAnalysis {
    String severity;
    String direction;
    float impactAngle;
    float confidence;
    bool isValidImpact;
    float combinedMagnitude;
};

// Construction-specific context
struct ConstructionContext {
    bool isWorkingAtHeight = false;
    float workingHeight = 0.0;
    bool isUsingPowerTools = false;
    float vibrationBaseline = 0.0;
    unsigned long lastToolDetection = 0;
    
    bool assessWorkContext(const SensorData& data, float gyroMag);
    float getHeightRiskMultiplier() const;
};

// Activity pattern recognition
struct ActivityClassifier {
    float activityBuffer[20] = {0};
    int bufferIndex = 0;
    float normalWorkThreshold = 2.5;
    
    bool isNormalWorkActivity(float accMag, float gyroMag);
    void updateActivityPattern(float activity);
};

// Function declarations
bool advancedFallDetection(const SensorData& data,  // Changed to use SensorData directly
                          float h3lis_ax, float h3lis_ay, float h3lis_az,
                          GyroHistory& gyroHist, AccelHistory& accHist, 
                          FallStateMachine& fallSM, AdaptiveThresholds& thresholds,
                          ConstructionContext& context, ActivityClassifier& classifier);

ImpactAnalysis analyzeCombinedImpact(const SensorData& data,  // Changed to use SensorData directly
                                   float h3lis_ax, float h3lis_ay, float h3lis_az);

String getImpactSeverity(float magnitude);
bool validateFallEvent(const ImpactAnalysis& impact, bool fallIndicators[10]);


// **ADD: Legacy compatibility functions**
bool detectFall(const SensorData& data, GyroHistory& gyroHist, AccelHistory& accHist);
String detectImpactWithH3LIS(float ax, float ay, float az);

// **ADD: Global objects for state management**
extern FallStateMachine fallSM;
extern AdaptiveThresholds thresholds;
extern ConstructionContext context;
extern ActivityClassifier classifier;


#endif
