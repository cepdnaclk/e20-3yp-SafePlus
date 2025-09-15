#pragma once
#include <Arduino.h>
#include "fall_detection.h"
#include "sensors.h"

// Simple utilities to simulate events during exhibition without real hazards.

// Simulate a light impact by crafting an ImpactAnalysis object.
ImpactAnalysis simulateLightImpact();

// Simulate fall event (sets pattern consistent with detection logic).
void triggerSimulatedFall();

// Flag that a simulated fall is active (cleared automatically after a short time).
bool isSimulatedFallActive();
