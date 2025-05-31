#include "fall_detection.h"
#include <math.h>

bool detectFall(const SensorData& data, GyroHistory& gyroHist) {
    // --- Normalize Raw Values ---
    float accX = data.ax / 16384.0;
    float accY = data.ay / 16384.0;
    float accZ = data.az / 16384.0;
    float gyroX = data.gx / 131.0;
    float gyroY = data.gy / 131.0;
    float gyroZ = data.gz / 131.0;

    // --- 1. AGVeSR ---
    float agvesr = fabs(accX) + fabs(accY) + fabs(accZ) +
                   fabs(gyroX) + fabs(gyroY) + fabs(gyroZ);
    bool agvesrFall = (agvesr > 20.0);  // Tunable

    // --- 2. Alim ---
    float aliX = accX - gyroX;
    float aliY = accY - gyroY;
    float aliZ = accZ - gyroZ;
    float alim = sqrt(aliX * aliX + aliY * aliY + aliZ * aliZ);
    bool alimFall = (alim > 2.0);  // Tunable

    // --- 3. Alpha Degree ---
    float alpha = atan2(accY, sqrt(accX * accX + accZ * accZ)) * 180.0 / PI;
    float alphaAbs = fabs(alpha);
    bool alphaFall = (alphaAbs > 60.0);  // Significant head tilt

    // --- 4. GyroReDi ---
    float gyroMag = sqrt(gyroX * gyroX + gyroY * gyroY + gyroZ * gyroZ);
    gyroHist.update(gyroMag);
    float gyroReDi = gyroHist.getAverage();
    bool gyroReDiFall = (gyroReDi > 50.0);  // Empirical threshold

    // --- 5. AGPeak ---
    float accMag = sqrt(accX * accX + accY * accY + accZ * accZ);
    bool accPeak = (accMag > 2.5);  // Tunable
    bool gyroPeak = (gyroMag > 150.0);
    bool agpeakFall = (accPeak && gyroPeak);

    // --- Decision Fusion ---
    int votes = 0;
    if (agvesrFall) votes++;
    if (alimFall) votes++;
    if (alphaFall) votes++;
    if (gyroReDiFall) votes++;
    if (agpeakFall) votes++;

    return (votes >= 3);  // At least 3 of 5 must vote fall
}
