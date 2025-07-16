#include "fall_detection.h"
#include <math.h>

// ESP32 optimized constants
static const float GRAVITY = 9.81;
static const float MPU_SENSITIVITY = 16384.0;  // ±2g range
static const float GYRO_SENSITIVITY = 131.0;   // ±250°/s range
static const float H3LIS_SENSITIVITY = 1000.0; // ±200g range (adjust based on your calibration)

// Internal state variables
static int inactivityCounter = 0;
static const int inactivityThreshold = 15;  // 1.5 seconds
static float lastAltitude = 0;
static bool firstAltitudeRead = true;
static const float heightFallThreshold = 0.20;  // meters - reduced for sensitivity
static unsigned long lastFallDetection = 0;
static const unsigned long FALL_COOLDOWN = 5000;  // 5 seconds between detections

// Enhanced thresholds for better detection
static const float FALL_THRESHOLD_LOWER = 0.3;   // Lower threshold for fall detection
static const float FALL_THRESHOLD_UPPER = 2.5;   // Upper threshold for impact
static const float ORIENTATION_THRESHOLD = 45.0; // degrees - reduced for sensitivity
static const float INACTIVITY_THRESHOLD = 0.5;   // g-force for inactivity

// Motion stability analysis
static float motionBuffer[5] = {1.0, 1.0, 1.0, 1.0, 1.0};
static int motionIndex = 0;
static unsigned long lastMotionTime = 0;

bool FallStateMachine::processFallDetection(bool fallIndicators[10], float impactConfidence) {
    unsigned long currentTime = millis();
    int activeIndicators = 0;
    
    for (int i = 0; i < 10; i++) {
        if (fallIndicators[i]) activeIndicators++;
    }

    switch (currentStage) {
        case NORMAL:
            if (activeIndicators >= 2 && impactConfidence > 0.25) {  // Reduced thresholds
                currentStage = PRE_FALL;
                stageStartTime = currentTime;
                confirmationCounter = 0;
            }
            break;

        case PRE_FALL:
            if (activeIndicators >= 4 && impactConfidence > 0.5) {  // Reduced thresholds
                confirmationCounter++;
                if (confirmationCounter >= 1) {  // Reduced confirmation requirement
                    currentStage = FALL_DETECTED;
                    return true;
                }
            } else if (currentTime - stageStartTime > 2000) {  // Reduced timeout
                currentStage = NORMAL;
                falseAlarmCounter++;
            }
            break;

        case FALL_DETECTED:
            currentStage = POST_FALL_ANALYSIS;
            stageStartTime = currentTime;
            break;

        case POST_FALL_ANALYSIS:
            if (currentTime - stageStartTime > 8000) {  // Reduced recovery time
                currentStage = NORMAL;
            }
            break;
    }
    return false;
}

void FallStateMachine::reset() {
    currentStage = NORMAL;
    confirmationCounter = 0;
    stageStartTime = 0;
}

bool ConstructionContext::assessWorkContext(const SensorData& data, float gyroMag) {
    // Detect power tool usage pattern - more specific range
    if (gyroMag > 50.0 && gyroMag < 150.0) {
        isUsingPowerTools = true;
        vibrationBaseline = gyroMag;
        lastToolDetection = millis();
        return false; // Suppress fall detection during tool use
    }
    
    // Tool use timeout
    if (millis() - lastToolDetection > 3000) {  // Reduced timeout
        isUsingPowerTools = false;
    }

    // Height assessment - more sensitive
    if (data.altitude > 1.0) {  // Reduced from 1.5
        isWorkingAtHeight = true;
        workingHeight = data.altitude;
        return true;
    }
    
    return false;
}

float ConstructionContext::getHeightRiskMultiplier() const {
    if (workingHeight > 10.0) return 1.5;  // Reduced multipliers
    if (workingHeight > 5.0) return 1.3;
    if (workingHeight > 2.0) return 1.1;
    return 1.0;
}

bool ActivityClassifier::isNormalWorkActivity(float accMag, float gyroMag) {
    updateActivityPattern(accMag + gyroMag * 0.1);
    
    // Calculate recent activity variance
    float mean = 0, variance = 0;
    for (int i = 0; i < 20; i++) mean += activityBuffer[i];
    mean /= 20.0;
    
    for (int i = 0; i < 20; i++) {
        variance += pow(activityBuffer[i] - mean, 2);
    }
    variance /= 20.0;
    
    // Normal work has moderate, consistent activity - adjusted thresholds
    return (variance < 2.0 && mean > 0.7 && mean < normalWorkThreshold);
}

void ActivityClassifier::updateActivityPattern(float activity) {
    activityBuffer[bufferIndex] = activity;
    bufferIndex = (bufferIndex + 1) % 20;
}

// Enhanced Impact Analysis with better thresholds
ImpactAnalysis analyzeCombinedImpact(const SensorData& data, float h3lis_ax, float h3lis_ay, float h3lis_az) {
    ImpactAnalysis result;
    
    // Normalize MPU data
    float mpu_ax = data.ax / MPU_SENSITIVITY;
    float mpu_ay = data.ay / MPU_SENSITIVITY;
    float mpu_az = data.az / MPU_SENSITIVITY;
    
    // Calculate magnitudes
    float mpuMagnitude = sqrt(mpu_ax*mpu_ax + mpu_ay*mpu_ay + mpu_az*mpu_az);
    float h3lisMagnitude = sqrt(h3lis_ax*h3lis_ax + h3lis_ay*h3lis_ay + h3lis_az*h3lis_az);
    
    // Intelligent sensor fusion with lowered thresholds
    if (h3lisMagnitude > 2.5 && data.h3lisValid) {  // Reduced from 4.0
        result.combinedMagnitude = h3lisMagnitude;
        result.confidence = 0.9;
        result.isValidImpact = true;
    } else if (mpuMagnitude > 1.8 && data.mpuValid) {  // Reduced from 2.5
        result.combinedMagnitude = mpuMagnitude;
        result.confidence = (h3lisMagnitude > 1.0 && data.h3lisValid) ? 0.8 : 0.6;
        result.isValidImpact = (h3lisMagnitude > 0.8 && data.h3lisValid);
    } else {
        // Low impact - combine both sensors
        float mpuWeight = data.mpuValid ? 0.7 : 0.0;
        float h3lisWeight = data.h3lisValid ? 0.3 : 0.0;
        result.combinedMagnitude = (mpuMagnitude * mpuWeight) + (h3lisMagnitude * h3lisWeight);
        result.confidence = 0.4;
        result.isValidImpact = (result.combinedMagnitude > 0.9);  // Reduced from 1.2
    }
    
    // Direction analysis using the more sensitive sensor
    float primary_ax, primary_ay, primary_az;
    if (h3lisMagnitude > 1.5 && data.h3lisValid) {  // Reduced from 2.0
        primary_ax = h3lis_ax;
        primary_ay = h3lis_ay;
        primary_az = h3lis_az;
    } else if (data.mpuValid) {
        primary_ax = mpu_ax;
        primary_ay = mpu_ay;
        primary_az = mpu_az;
    } else {
        result.direction = "unknown";
        result.impactAngle = 0.0;
        result.severity = "no";
        return result;
    }
    
    float maxAxis = max(abs(primary_ax), max(abs(primary_ay), abs(primary_az)));
    if (abs(primary_az) == maxAxis) {
        result.direction = (primary_az > 0) ? "top" : "bottom";
    } else if (abs(primary_ay) == maxAxis) {
        result.direction = (primary_ay > 0) ? "front" : "back";
    } else {
        result.direction = (primary_ax > 0) ? "right" : "left";
    }
    
    // Impact angle calculation
    result.impactAngle = atan2(sqrt(primary_ax*primary_ax + primary_ay*primary_ay), 
                              abs(primary_az)) * 180.0 / PI;
    
    // Severity classification with adjusted thresholds
    result.severity = getImpactSeverity(result.combinedMagnitude);
    
    return result;
}

String getImpactSeverity(float magnitude) {
    if (magnitude >= 8.0) return "critical";   // Reduced from 15.0
    if (magnitude >= 5.0) return "severe";     // Reduced from 10.0
    if (magnitude >= 3.0) return "moderate";   // Reduced from 6.0
    if (magnitude >= 1.5) return "mild";       // Reduced from 3.0
    return "no";
}

bool validateFallEvent(const ImpactAnalysis& impact, bool fallIndicators[10]) {
    int criticalFeatures = 0;
    
    for (int i = 0; i < 10; i++) {
        if (fallIndicators[i]) criticalFeatures++;
    }
    
    // More lenient validation logic
    if (impact.severity == "critical") return (criticalFeatures >= 2);  // Reduced from 4
    if (impact.severity == "severe") return (criticalFeatures >= 3);    // Reduced from 5
    if (impact.severity == "moderate") return (criticalFeatures >= 4);  // Reduced from 6
    if (impact.severity == "mild") return (criticalFeatures >= 5);      // Reduced from 7
    
    return false;
}

// Enhanced fall detection with altitude integration
bool smartFallDetectionWithAltitude(const SensorData& data, float h3lis_ax, float h3lis_ay, float h3lis_az,
                                   GyroHistory& gyroHist, AccelHistory& accHist, 
                                   FallStateMachine& fallSM, AdaptiveThresholds& thresholds,
                                   ConstructionContext& context, ActivityClassifier& classifier) {
    // Check cooldown period
    if (millis() - lastFallDetection < FALL_COOLDOWN) {
        return false;
    }
    
    // Check sensor validity
    if (!data.mpuValid && !data.h3lisValid) {
        return false;
    }
    
    // Convert sensor data
    float mpu_ax = data.ax / MPU_SENSITIVITY;
    float mpu_ay = data.ay / MPU_SENSITIVITY;
    float mpu_az = data.az / MPU_SENSITIVITY;
    
    float mpuMagnitude = sqrt(mpu_ax*mpu_ax + mpu_ay*mpu_ay + mpu_az*mpu_az);
    float h3lisMagnitude = sqrt(h3lis_ax*h3lis_ax + h3lis_ay*h3lis_ay + h3lis_az*h3lis_az);
    
    float gyroX = data.gx / GYRO_SENSITIVITY;
    float gyroY = data.gy / GYRO_SENSITIVITY;
    float gyroZ = data.gz / GYRO_SENSITIVITY;
    float gyroMagnitude = sqrt(gyroX*gyroX + gyroY*gyroY + gyroZ*gyroZ);
    
    // Update histories
    gyroHist.update(gyroMagnitude);
    accHist.update(mpuMagnitude);
    
    // **ALTITUDE-BASED FALL DETECTION**
    static unsigned long lastAltitudeTime = 0;
    float altitudeChange = 0;
    float altitudeRate = 0;
    
    if (!firstAltitudeRead && millis() - lastAltitudeTime > 100) {
        altitudeChange = lastAltitude - data.altitude;  // Positive = falling down
        altitudeRate = altitudeChange / ((millis() - lastAltitudeTime) / 1000.0);  // m/s
        lastAltitudeTime = millis();
    } else if (firstAltitudeRead) {
        firstAltitudeRead = false;
        lastAltitudeTime = millis();
    }
    lastAltitude = data.altitude;
    
    // **MOTION STABILITY ANALYSIS**
    if (millis() - lastMotionTime > 100) {
        motionBuffer[motionIndex] = mpuMagnitude;
        motionIndex = (motionIndex + 1) % 5;
        lastMotionTime = millis();
    }
    
    float motionVariance = 0;
    float motionMean = 0;
    for (int i = 0; i < 5; i++) motionMean += motionBuffer[i];
    motionMean /= 5.0;
    
    for (int i = 0; i < 5; i++) {
        motionVariance += pow(motionBuffer[i] - motionMean, 2);
    }
    motionVariance /= 5.0;
    
    bool isStable = (motionVariance < 0.2 && motionMean > 0.6 && motionMean < 1.5);
    
    // Analyze combined impact
    ImpactAnalysis impact = analyzeCombinedImpact(data, h3lis_ax, h3lis_ay, h3lis_az);
    
    // Check construction context
    bool heightRisk = context.assessWorkContext(data, gyroMagnitude);
    float riskMultiplier = context.getHeightRiskMultiplier();
    
    // Skip during power tool use
    if (context.isUsingPowerTools) {
        return false;
    }
    
    // **FALL DETECTION METHODS**
    bool fallDetected = false;
    
    // Method 1: Altitude-based fall detection
    if (altitudeChange > 0.15 && altitudeRate > 0.3) {  // Reduced thresholds
        fallDetected = true;
        Serial.printf("Fall detected - Altitude drop: %.2fm at %.2fm/s\n", altitudeChange, altitudeRate);
    }
    
    // Method 2: Combined altitude + acceleration
    if (altitudeChange > 0.10 && (mpuMagnitude > 1.6 || h3lisMagnitude > 2.0)) {
        fallDetected = true;
        Serial.println("Fall detected - Altitude + impact!");
    }
    
    // Method 3: High impact detection
    if (mpuMagnitude > 2.0 || h3lisMagnitude > 2.5) {
        fallDetected = true;
        Serial.println("Fall detected - High impact!");
    }
    
    // Method 4: Low gravity + altitude change
    if (mpuMagnitude < 0.4 && altitudeChange > 0.08) {
        fallDetected = true;
        Serial.println("Fall detected - Free fall + altitude!");
    }
    
    // Method 5: Sudden rotation + impact
    static float lastGyroMag = 0;
    float gyroChange = abs(gyroMagnitude - lastGyroMag);
    if (gyroChange > 25.0 && mpuMagnitude > 1.2) {  // Reduced thresholds
        fallDetected = true;
        Serial.println("Fall detected - Sudden rotation + impact!");
    }
    lastGyroMag = gyroMagnitude;
    
    // **FILTERS TO REDUCE FALSE POSITIVES**
    // Filter 1: Ignore gentle, stable movements
    if (isStable && mpuMagnitude < 1.4 && altitudeChange < 0.12) {
        fallDetected = false;
    }
    
    // Filter 2: Ignore elevator/stairs movement
    if (altitudeRate > 0.05 && altitudeRate < 0.25 && isStable) {
        fallDetected = false;
        Serial.println("Filtered out - Elevator/stairs movement");
    }
    
    // Filter 3: Brief spike filter for walking
    static unsigned long spikeStartTime = 0;
    static bool inSpike = false;
    
    if (mpuMagnitude > 1.3 && !inSpike) {
        inSpike = true;
        spikeStartTime = millis();
    } else if (mpuMagnitude < 1.0 && inSpike) {
        inSpike = false;
    }
    
    if (inSpike && fallDetected && (millis() - spikeStartTime < 120)) {
        fallDetected = false;
        Serial.println("Filtered out - Brief spike (walking)");
    }
    
    if (fallDetected) {
        lastFallDetection = millis();
        Serial.printf("FALL CONFIRMED! MPU: %.2f, H3LIS: %.2f, Altitude: %.2fm, Rate: %.2fm/s\n", 
                     mpuMagnitude, h3lisMagnitude, altitudeChange, altitudeRate);
        return true;
    }
    
    return false;
}

// Main fall detection function
bool advancedFallDetection(const SensorData& data,
                          float h3lis_ax, float h3lis_ay, float h3lis_az,
                          GyroHistory& gyroHist, AccelHistory& accHist, 
                          FallStateMachine& fallSM, AdaptiveThresholds& thresholds,
                          ConstructionContext& context, ActivityClassifier& classifier) {
    
    // Use the enhanced fall detection with altitude
    return smartFallDetectionWithAltitude(data, h3lis_ax, h3lis_ay, h3lis_az,
                                         gyroHist, accHist, fallSM, thresholds,
                                         context, classifier);
}

// Legacy compatibility functions
bool detectFall(const SensorData& data, GyroHistory& gyroHist, AccelHistory& accHist) {
    // Declare the required global variables if not already declared
    extern FallStateMachine fallSM;
    extern AdaptiveThresholds thresholds;
    extern ConstructionContext context;
    extern ActivityClassifier classifier;
    
    return advancedFallDetection(
        data, 
        data.h3lis_ax, data.h3lis_ay, data.h3lis_az,
        gyroHist, accHist, 
        fallSM, thresholds, context, classifier
    );
}

String detectImpactWithH3LIS(float ax, float ay, float az) {
    float magnitude = sqrt(ax * ax + ay * ay + az * az);
    return getImpactSeverity(magnitude);
}
