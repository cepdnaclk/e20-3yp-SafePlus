#include "event_publisher.h"

String buildTelemetryJson(const SensorData& data,
                          const ImpactAnalysis& impact,
                          bool fallActive,
                          bool impactActive,
                          bool gasDetected,
                          bool buttonPressed,
                          int batteryPct,
                          const String& batteryStatus,
                          float heartRate) {
    StaticJsonDocument<700> doc; // adjust if needed

    doc["mode"] = modeString();
    doc["id"] = "Helmet_1"; // could be parameterized

    // Environment
    doc["temp"] = data.temperature;
    doc["hum"]  = data.humidity;

    // Heart rate
    doc["bpm"] = heartRate;

    // Location
    JsonArray loc = doc.createNestedArray("loc");
    loc.add(data.latitude);
    loc.add(data.longitude);

    // Gas
    doc["gas"] = data.gasPPM;
    doc["gasType"] = data.gasType;
    doc["gasAlert"] = gasDetected;

    // Button / SOS
    doc["sos"] = buttonPressed;

    // Impact / Fall
    JsonObject impactObj = doc.createNestedObject("impact");
    impactObj["severity"] = impact.severity;
    impactObj["angle"] = impact.impactAngle;
    impactObj["direction"] = impact.direction;
    impactObj["mag"] = impact.combinedMagnitude;
    impactObj["active"] = impactActive;

    doc["fallActive"] = fallActive;

    // Battery
    JsonObject bat = doc.createNestedObject("battery");
    bat["pct"] = batteryPct;
    bat["status"] = batteryStatus;

    String out;
    serializeJson(doc, out);
    return out;
}
