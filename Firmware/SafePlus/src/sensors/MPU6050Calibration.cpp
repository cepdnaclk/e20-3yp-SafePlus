#include "MPU6050Calibration.h"

MPUOffsets mpuOffsets = {0};

void calibrateMPU() {
    Serial.println("Place helmet in normal resting position. Starting calibration in 5 seconds...");
    delay(5000);

    int32_t sumAX = 0, sumAY = 0, sumAZ = 0;
    int32_t sumGX = 0, sumGY = 0, sumGZ = 0;
    const int samples = 100;

    for (int i = 0; i < samples; ++i) {
        mpu.getMotion6(&mpuOffsets.accX, &mpuOffsets.accY, &mpuOffsets.accZ, &mpuOffsets.gyroX, &mpuOffsets.gyroY, &mpuOffsets.gyroZ);
        sumAX += mpuOffsets.accX;
        sumAY += mpuOffsets.accY;
        sumAZ += mpuOffsets.accZ;
        sumGX += mpuOffsets.gyroX;
        sumGY += mpuOffsets.gyroY;
        sumGZ += mpuOffsets.gyroZ;
        delay(10);
    }

    mpuOffsets.accX = sumAX / samples;
    mpuOffsets.accY = sumAY / samples;
    mpuOffsets.accZ = sumAZ / samples;
    mpuOffsets.gyroX = sumGX / samples;
    mpuOffsets.gyroY = sumGY / samples;
    mpuOffsets.gyroZ = sumGZ / samples;

    // Save to flash
    preferences.begin("mpu6050", false);
    preferences.putInt("accX", mpuOffsets.accX);
    preferences.putInt("accY", mpuOffsets.accY);
    preferences.putInt("accZ", mpuOffsets.accZ);
    preferences.putInt("gyroX", mpuOffsets.gyroX);
    preferences.putInt("gyroY", mpuOffsets.gyroY);
    preferences.putInt("gyroZ", mpuOffsets.gyroZ);
    preferences.end();

    Serial.println("MPU6050 Calibration Complete:");
    Serial.printf("Acc: %d, %d, %d | Gyro: %d, %d, %d\n",
                  mpuOffsets.accX, mpuOffsets.accY, mpuOffsets.accZ,
                  mpuOffsets.gyroX, mpuOffsets.gyroY, mpuOffsets.gyroZ);
}

void loadMPUCalibration() {
    preferences.begin("mpu6050", true);
    mpuOffsets.accX = preferences.getInt("accX", 0);
    mpuOffsets.accY = preferences.getInt("accY", 0);
    mpuOffsets.accZ = preferences.getInt("accZ", 0);
    mpuOffsets.gyroX = preferences.getInt("gyroX", 0);
    mpuOffsets.gyroY = preferences.getInt("gyroY", 0);
    mpuOffsets.gyroZ = preferences.getInt("gyroZ", 0);
    preferences.end();
}

void applyMPUOffsets(int16_t &ax, int16_t &ay, int16_t &az, int16_t &gx, int16_t &gy, int16_t &gz) {
    ax -= mpuOffsets.accX;
    ay -= mpuOffsets.accY;
    az -= mpuOffsets.accZ;
    gx -= mpuOffsets.gyroX;
    gy -= mpuOffsets.gyroY;
    gz -= mpuOffsets.gyroZ;
}
