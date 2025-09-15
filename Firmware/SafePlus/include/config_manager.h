#pragma once

#include <Arduino.h>

// Detection / operating modes for the helmet
enum class DetectionMode : uint8_t {
    DEMO = 0,      // Exhibition/demo (very sensitive)
    PRODUCTION = 1 // Real deployment (safer, validated thresholds)
};

struct FallThresholds {
    float fallLowerG;       // Low-g (free-fall) trigger
    float impactG;          // Primary impact magnitude threshold
    float rotationDelta;    // Sudden rotation delta threshold (deg/s)
    float altitudeDrop;     // Altitude drop (m)
    float altitudeDropFree; // Altitude drop with low-g (m)
    float combinedImpactMPU;// Secondary MPU magnitude
    float combinedImpactH3; // Secondary high-G sensor magnitude
    float inactivityG;      // Inactivity accel magnitude upper bound
    float orientationDeg;   // Orientation angle threshold
};

struct SeverityBands {
    float mild;
    float moderate;
    float severe;
    float critical;
};

struct ConfigProfile {
    DetectionMode mode;
    FallThresholds fall;
    SeverityBands severity;
};

// Returns current active profile (singleton style)
const ConfigProfile& getActiveConfig();
// Initialize config (choose mode before setup or default to DEMO)
void initConfig(DetectionMode mode);
// Optionally switch mode at runtime
void setDetectionMode(DetectionMode mode);
// Serialize config mode as const char* for telemetry
const char* modeString();
