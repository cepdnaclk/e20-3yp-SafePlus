#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>
#include "config_manager.h"
#include "fall_detection.h"
#include "sensors.h"

// Builds a unified JSON string for telemetry including mode and optional event fields.
String buildTelemetryJson(const SensorData& data,
                          const ImpactAnalysis& impact,
                          bool fallActive,
                          bool impactActive,
                          bool gasDetected,
                          bool buttonPressed,
                          int batteryPct,
                          const String& batteryStatus,
                          float heartRate);
