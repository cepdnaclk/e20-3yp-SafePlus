#include "sensors.h"
#include "MAX30105.h"
#include "heartRate.h"
#include <Wire.h>
#include <MPU6050.h>
#include <TinyGPS++.h>
#include <DHT.h>
#include <Adafruit_BMP280.h>
#include <Preferences.h>
#include "MPU6050Calibration.h"
#include "H3LISCalibration.h"
#include "MQ2Calibration.h" 

#define RXD2               16
#define TXD2               17
#define GPS_BAUD           9600
#define DHTPIN             4
#define DHT_POWER_PIN      33
#define DHTTYPE            DHT22
#define SEA_LEVEL_PRESSURE_HPA 1013.25

MPUOffsets mpuOffsets = {0};

// Objects
MPU6050 mpu;
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);
DFRobot_H3LIS200DL_I2C h3lis(&Wire, 0x18);
Adafruit_BMP280 bmp;
MAX30105 particleSensor;
Preferences preferences;
DHT dht(DHTPIN, DHTTYPE);

// Heart rate buffer
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE], rateSpot = 0;
long lastBeat = 0;
int beatAvg = 0;

// Sensor calibration
float referenceAltitude = 0.0;
bool isAltitudeCalibrated = false;
double lastLatitude = 0.0, lastLongitude = 0.0;
unsigned long lastDHTReadTime = 0;
const unsigned long DHT_INTERVAL = 3 * 60 * 1000;
float lastTemperature = 0.0;
float lastHumidity = 0.0;

// Legacy H3LIS variables
float offsetX = 0.0, offsetY = 0.0, offsetZ = 0.0;
const int CALIBRATION_SAMPLES = 100;

void initHeartRateSensor() {
    if (!particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
        Serial.println("MAX30102 not found.");
        return;
    }
    particleSensor.setup();
    particleSensor.setPulseAmplitudeIR(0x2A);
    particleSensor.setPulseAmplitudeRed(0x0A);
    Serial.println("MAX30102 Initialized.");
}

float getHeartRate() {
    long irValue = particleSensor.getIR();
    Serial.print("IR Value: ");
    Serial.println(irValue);

    if (checkForBeat(irValue)) {
        Serial.println("Heartbeat detected!");
        long now = millis();
        long delta = now - lastBeat;
        lastBeat = now;
        float bpm = 60.0 / (delta / 1000.0);
        if (bpm >= 20 && bpm <= 255) {
            rates[rateSpot++] = (byte)bpm;
            rateSpot %= RATE_SIZE;
            beatAvg = 0;
            for (byte i = 0; i < RATE_SIZE; i++) beatAvg += rates[i];
            beatAvg /= RATE_SIZE;
        }
    }
    return beatAvg;
}

float HeartRateFromIR() {
    long irValue = particleSensor.getIR();
    Serial.print("IR Value: ");
    Serial.println(irValue);
    if (irValue < 50000) return 0;
    
    float minIR = 60000.0;
    float maxIR = 100000.0;
    int minHR = 60.0;
    int maxHR = 100.0;
    
    irValue = constrain(irValue, minIR, maxIR);
    int bpm = minHR + (maxHR - minHR) * ((irValue - minIR) / (maxIR - minIR));
    return bpm;
}

void initSensors() {
    Wire.begin(21, 22);

    // MPU6050
    mpu.initialize();
    if (!mpu.testConnection()) {
        Serial.println("❌ MPU6050 failed!");
        return;
    }
    Serial.println("✅ MPU6050 OK.");

    loadMPUCalibration();
    if (!mpuOffsets.isValid) {
        Serial.println("No valid calibration found. Starting tilted sensor calibration...");
        if (!calibrateMPUTiltedSensor()) {
            Serial.println("❌ Tilted sensor calibration failed!");
        }
    }

    // GPS
    gpsSerial.begin(GPS_BAUD, SERIAL_8N1, RXD2, TXD2);
    Serial.println("GPS OK.");

    // H3LIS200DL
    while (!h3lis.begin()) {
        Serial.println("H3LIS200DL failed, retrying...");
        delay(500);
    }
    h3lis.setRange(DFRobot_LIS::eH3lis200dl_100g);
    h3lis.setAcquireRate(DFRobot_LIS::eNormal_50HZ);
    Serial.println("H3LIS200DL OK.");

    if (!loadH3lisCalibration()) {
        Serial.println("No calibration found. Running automatic calibration...");
        Serial.println("Please keep helmet still for 10 seconds...");
        if (calibrateH3lisSensorAutomatic()) {
            Serial.println("Automatic calibration completed successfully!");
        } else {
            Serial.println("Automatic calibration failed, using default values.");
            setDefaultH3lisCalibration();
        }
    } else {
        Serial.println("H3LIS200DL calibration loaded from flash.");
    }

    // MQ2
    if (!initMQ2Sensor()) {
        Serial.println("❌ MQ2 initialization failed!");
    }
    
    // DHT22
    pinMode(DHT_POWER_PIN, OUTPUT);
    digitalWrite(DHT_POWER_PIN, LOW);
    dht.begin();

    // BMP280
    if (bmp.begin(0x76)) {
        Serial.println("BMP280 initialized.");
        preferences.begin("altitude", false);
        if (preferences.isKey("refAlt")) {
            referenceAltitude = preferences.getFloat("refAlt", 0.0);
            isAltitudeCalibrated = true;
            Serial.print("Loaded saved Reference Altitude: ");
            Serial.println(referenceAltitude);
        } else {
            isAltitudeCalibrated = false;
            Serial.println("No Reference Altitude saved yet.");
        }
    } else {
        Serial.println("BMP280 initialization failed!");
    }
}

void updateReferenceAltitude() {
    float currentAlt = bmp.readAltitude(SEA_LEVEL_PRESSURE_HPA)-5;
    referenceAltitude = currentAlt;
    preferences.putFloat("refAlt", referenceAltitude);
    preferences.end(); 
    isAltitudeCalibrated = true;
    Serial.print("New Reference Altitude set: ");
    Serial.println(referenceAltitude);
}

void handleIncomingCommand(String payload) {
    Serial.print("Received command: ");
    Serial.println(payload);
    if (payload.indexOf("set_ref_altitude") != -1) {
        updateReferenceAltitude();
    }
}

// **FIXED: Complete sensor data collection with validity flags**
SensorData collectSensorData() {
    SensorData data;

    // MPU6050 with validity check
    data.mpuValid = mpu.testConnection();
    if (data.mpuValid) {
        mpu.getMotion6(&data.ax, &data.ay, &data.az, &data.gx, &data.gy, &data.gz);
        applyMPUOffsets(data.ax, data.ay, data.az, data.gx, data.gy, data.gz);
    } else {
        data.ax = data.ay = data.az = 0;
        data.gx = data.gy = data.gz = 0;
        Serial.println("MPU6050 not responding!");
    }

    // H3LIS with validity check
    data.h3lisValid = true; // Assume valid initially
    float h3lis_x = readH3LISAxisDirect(0x28);
    float h3lis_y = readH3LISAxisDirect(0x2A);
    float h3lis_z = readH3LISAxisDirect(0x2C);
    
    // Check if H3LIS readings are valid
    if (isnan(h3lis_x) || isnan(h3lis_y) || isnan(h3lis_z) || 
        abs(h3lis_x) > 200 || abs(h3lis_y) > 200 || abs(h3lis_z) > 200) {
        data.h3lisValid = false;
        data.h3lis_ax = 0;
        data.h3lis_ay = 0;
        data.h3lis_az = 0;
        Serial.println("H3LIS200DL reading invalid!");
    } else {
        applyH3lisCalibration(h3lis_x, h3lis_y, h3lis_z);
        data.h3lis_ax = h3lis_x;
        data.h3lis_ay = h3lis_y;
        data.h3lis_az = h3lis_z;
        
        Serial.print("H3LIS200DL X: ");
        Serial.print(h3lis_x);
        Serial.print(" Y: ");
        Serial.print(h3lis_y);
        Serial.print(" Z: ");
        Serial.println(h3lis_z);
    }

    // GPS with validity check
    data.gpsValid = false;
    while (gpsSerial.available()) {
        gps.encode(gpsSerial.read());
        if (gps.location.isUpdated() && gps.location.isValid()) {
            lastLatitude = gps.location.lat();
            lastLongitude = gps.location.lng();
            data.gpsValid = true;
        }
    }
    data.latitude = lastLatitude;
    data.longitude = lastLongitude;

    // Motion detection (only if MPU is valid)
    bool motionDetected = false;
    if (data.mpuValid) {
        float accMag = sqrt(pow(data.ax / 16384.0, 2) +
                            pow(data.ay / 16384.0, 2) +
                            pow(data.az / 16384.0, 2));
        
        float gyroMag = sqrt(pow(data.gx / 131.0, 2) +
                             pow(data.gy / 131.0, 2) +
                             pow(data.gz / 131.0, 2));
        
        const float MOTION_ACCEL_THRESHOLD = 1.05;
        const float MOTION_GYRO_THRESHOLD = 5.0;
        motionDetected = (accMag > MOTION_ACCEL_THRESHOLD) || (gyroMag > MOTION_GYRO_THRESHOLD);
    }

    // MQ2 with validity check
    updateMQ2Power(motionDetected);
    
    float gasPPM;
    String gasType;
    data.gasValid = processMQ2Reading(gasPPM, gasType);
    
    data.gasPPM = gasPPM;
    data.gasType = gasType;

    // DHT22 with validity check
    data.environmentalValid = false;
    unsigned long now = millis();
    if (now - lastDHTReadTime >= DHT_INTERVAL || lastDHTReadTime == 0) {
        digitalWrite(DHT_POWER_PIN, HIGH);
        delay(200);
        float temp = dht.readTemperature();
        float hum = dht.readHumidity();
        digitalWrite(DHT_POWER_PIN, LOW);
        
        if (!isnan(temp) && !isnan(hum)) {
            lastTemperature = temp;
            lastHumidity = hum;
            data.environmentalValid = true;
        }
        lastDHTReadTime = now;
    } else {
        data.environmentalValid = (lastTemperature != 0.0 && lastHumidity != 0.0);
    }

    data.temperature = lastTemperature;
    data.humidity = lastHumidity;

    // BMP280 altitude
    if (isAltitudeCalibrated) {
        float currentAlt = bmp.readAltitude(SEA_LEVEL_PRESSURE_HPA);
        if (!isnan(currentAlt)) {
            float height = currentAlt - referenceAltitude;
            data.altitude = height;
            data.floorLevel = max(int(height / 3.9), 0);
        } else {
            data.altitude = 0.0;
            data.floorLevel = 0;
        }
    } else {
        data.altitude = 0.0;
        data.floorLevel = 0;
    }

    // Heart rate validity
    data.heartRateValid = (beatAvg > 0 && beatAvg < 255);
    data.heartRate = beatAvg;

    // Set timestamp
    data.timestamp = millis();

    return data;
}
