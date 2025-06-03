#include "fall_detection.h"
#include <math.h>

// Internal state
static int inactivityCounter = 0;
const int inactivityThreshold = 10;  // ~1 second if sampling at 10Hz

static float lastAltitude = 0;
static bool firstAltitudeRead = true;
const float heightFallThreshold = 0.3;  // meters of sudden drop

bool detectFall(const SensorData& data, GyroHistory& gyroHist, AccelHistory& accHist) {
    // Normalize MPU6050 values
    float accX = data.ax / 16384.0;
    float accY = data.ay / 16384.0;
    float accZ = data.az / 16384.0;
    float gyroX = data.gx / 131.0;
    float gyroY = data.gy / 131.0;
    float gyroZ = data.gz / 131.0;
    float altitude = data.altitude;  // from BMP280 in meters

    float accMag = sqrt(accX * accX + accY * accY + accZ * accZ);
    float gyroMag = sqrt(gyroX * gyroX + gyroY * gyroY + gyroZ * gyroZ);

    // Update history
    gyroHist.update(gyroMag);
    accHist.update(accMag);

    // -------- Feature 1: AGVeSR --------
    float agvesr = fabs(accX) + fabs(accY) + fabs(accZ) + fabs(gyroX) + fabs(gyroY) + fabs(gyroZ);
    bool agvesrFall = (agvesr > 30.0);  // very high motion (fall-like impact)

    // -------- Feature 2: ALIM --------
    float aliX = accX - gyroX;
    float aliY = accY - gyroY;
    float aliZ = accZ - gyroZ;
    float alim = sqrt(aliX * aliX + aliY * aliY + aliZ * aliZ);
    bool alimFall = (alim > 4.5);  // discriminates fall vs motion better

    // -------- Feature 3: Head tilt --------
    float alpha = atan2(accY, sqrt(accX * accX + accZ * accZ)) * 180.0 / PI;
    bool alphaFall = (fabs(alpha) > 75.0);  // stricter threshold

    // -------- Feature 4: Rotation Dynamics --------
    bool gyroReDiFall = (gyroHist.getAverage() > 100.0);  // only extreme head rotation

    // -------- Feature 5: Peak Detection --------
    bool accPeak = (accMag > 3.5);
    bool gyroPeak = (gyroMag > 250.0);
    bool agpeakFall = (accPeak && gyroPeak);

    // -------- Feature 6: Lying posture --------
    bool lyingPosture = (fabs(accZ) < 0.5);  // nearly flat

    // -------- Feature 7: Inactivity --------
    bool lowActivity = (accHist.getAverage() < 1.0 && gyroHist.getAverage() < 8.0);
    if (lowActivity) {
        inactivityCounter++;
    } else {
        inactivityCounter = 0;
    }
    bool inactivityAfterImpact = (inactivityCounter >= inactivityThreshold);

    // -------- Feature 8: BMP280 sudden height drop --------
    float deltaHeight = 0;
    if (!firstAltitudeRead) {
        deltaHeight = lastAltitude - altitude;
    } else {
        firstAltitudeRead = false;
    }
    lastAltitude = altitude;

    bool heightFall = (deltaHeight > heightFallThreshold);  // sudden downward movement

    // -------- Voting Decision --------
    int votes = 0;
    if (agvesrFall) votes++;
    if (alimFall) votes++;
    if (alphaFall) votes++;
    if (gyroReDiFall) votes++;
    if (agpeakFall) votes++;
    if (lyingPosture) votes++;
    if (inactivityAfterImpact) votes++;
    if (heightFall) votes++;
    

    // Return true only if strong evidence
    return (votes >= 5);  // must satisfy at least 5/8 features
}

String detectImpactWithH3LIS(float ax, float ay, float az) {
    float magnitude = sqrt(ax * ax + ay * ay + az * az);

    if (magnitude >= 8.0) {
        return "severe";
    } else if (magnitude >= 4.0) {
        return "moderate";
    } else if (magnitude >= 2.0) {
        return "mild";
    } else {
        return "no";
    }
}
