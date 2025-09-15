#include "config_manager.h"

static ConfigProfile activeProfile; 

static ConfigProfile buildDemoProfile() {
    ConfigProfile p{}; p.mode = DetectionMode::DEMO;
    p.fall = {
        /*fallLowerG*/        0.30f,
        /*impactG*/           1.6f,
        /*rotationDelta*/     20.0f,
        /*altitudeDrop*/      0.12f,
        /*altitudeDropFree*/  0.08f,
        /*combinedImpactMPU*/ 1.2f,
        /*combinedImpactH3*/  1.8f,
        /*inactivityG*/       0.5f,
        /*orientationDeg*/    40.0f
    };
    // Further reduced for tiny tap demo sensitivity (mild lowered from 1.2 -> 0.85)
    p.severity = {0.85f, 1.6f, 2.4f, 3.2f};
    return p;
}

static ConfigProfile buildProductionProfile() {
    ConfigProfile p{}; p.mode = DetectionMode::PRODUCTION;
    p.fall = {
        /*fallLowerG*/        0.45f,
        /*impactG*/           3.2f,
        /*rotationDelta*/     90.0f,
        /*altitudeDrop*/      0.30f,
        /*altitudeDropFree*/  0.25f,
        /*combinedImpactMPU*/ 2.8f,
        /*combinedImpactH3*/  3.5f,
        /*inactivityG*/       0.6f,
        /*orientationDeg*/    50.0f
    };
    p.severity = {3.0f, 6.0f, 10.0f, 15.0f};
    return p;
}

void applyProfile(const ConfigProfile& p) {
    activeProfile = p;
}

void initConfig(DetectionMode mode) {
    if (mode == DetectionMode::DEMO) {
        applyProfile(buildDemoProfile());
    } else {
        applyProfile(buildProductionProfile());
    }
}

void setDetectionMode(DetectionMode mode) {
    initConfig(mode);
}

const ConfigProfile& getActiveConfig() {
    return activeProfile;
}

const char* modeString() {
    switch (activeProfile.mode) {
        case DetectionMode::DEMO: return "DEMO";
        case DetectionMode::PRODUCTION: return "PRODUCTION";
        default: return "UNKNOWN";
    }
}
