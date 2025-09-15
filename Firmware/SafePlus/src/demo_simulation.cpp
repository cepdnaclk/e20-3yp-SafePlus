#include "demo_simulation.h"
#include <math.h>

static bool simFall = false;
static unsigned long simFallStart = 0;
static const unsigned long SIM_FALL_DURATION = 3000; // 3s showcase

ImpactAnalysis simulateLightImpact() {
    ImpactAnalysis imp; // default zeroed by constructor if defined POD
    imp.severity = "mild";
    imp.combinedMagnitude = 1.5f; // within demo mild band
    imp.direction = "front";
    imp.impactAngle = 25.0f;
    imp.confidence = 0.8f;
    imp.isValidImpact = true;
    return imp;
}

void triggerSimulatedFall() {
    simFall = true;
    simFallStart = millis();
}

bool isSimulatedFallActive() {
    if (simFall && millis() - simFallStart > SIM_FALL_DURATION) {
        simFall = false;
    }
    return simFall;
}
