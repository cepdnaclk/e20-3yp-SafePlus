#include "sensors.h"
#include "MAX30105.h"
#include "heartRate.h"
#include <Wire.h>
#include <MPU6050.h>
#include <TinyGPS++.h>
#include <DFRobot_LIS.h>
#include <DHT.h>

#define MQ2_PIN 34
#define MQ2_POWER_PIN 27
#define RXD2 16
#define TXD2 17
#define GPS_BAUD 9600

#define DHTPIN 4         // DHT22 data pin
#define DHT_POWER_PIN 33   // DHT22 power pin
#define DHTTYPE DHT22

MPU6050 mpu;
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);
DFRobot_H3LIS200DL_I2C h3lis(&Wire, 0x18); // Change to 0x19 if needed

MAX30105 particleSensor;
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute;
int beatAvg;
double lastLatitude = 0.0;
double lastLongitude = 0.0;

DHT dht(DHTPIN, DHTTYPE);

void initHeartRateSensor() {
    if (!particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
        Serial.println("MAX30102 not found. Check wiring.");
        return;
    }

    particleSensor.setup();
    particleSensor.setPulseAmplitudeIR(0x30);
    particleSensor.setPulseAmplitudeRed(0x0A);
    Serial.println("MAX30102 Initialized.");
}

float getHeartRate() {
    long irValue = particleSensor.getIR();

    Serial.println("IR Value: " + String(irValue));
    if (irValue < 50000) {
        return 0;
    }

    if (checkForBeat(irValue)) {
        long delta = millis() - lastBeat;
        lastBeat = millis();

        beatsPerMinute = 60.0 / (delta / 1000.0);
        if (beatsPerMinute < 255 && beatsPerMinute > 20) {
            rates[rateSpot++] = (byte)beatsPerMinute;
            rateSpot %= RATE_SIZE;

            beatAvg = 0;
            for (byte i = 0; i < RATE_SIZE; i++) {
                beatAvg += rates[i];
            }
            beatAvg /= RATE_SIZE;
        }
    }

    return beatAvg;
}

void initSensors() {
    Wire.begin(21, 22);

    mpu.initialize();
    if (!mpu.testConnection()) {
        Serial.println("MPU6050 connection failed!");
    } else {
        Serial.println("MPU6050 Initialized.");
    }

    gpsSerial.begin(GPS_BAUD, SERIAL_8N1, RXD2, TXD2);
    Serial.println("GPS Initialized.");

    // H3LIS200DL
    while (!h3lis.begin()) {
        Serial.println("H3LIS200DL init failed, check wiring & address");
        delay(1000);
    }
    Serial.print("H3LIS200DL chip ID: ");
    Serial.println(h3lis.getID(), HEX);

    h3lis.setRange(DFRobot_LIS::eH3lis200dl_100g);
    h3lis.setAcquireRate(DFRobot_LIS::eNormal_50HZ);
    Serial.println("H3LIS200DL initialized.");

    // MQ2 setup
    pinMode(MQ2_POWER_PIN, OUTPUT);
    digitalWrite(MQ2_POWER_PIN, LOW);

    // DHT22 setup
    pinMode(DHT_POWER_PIN, OUTPUT);
    digitalWrite(DHT_POWER_PIN, LOW);  // Power ON DHT22
    delay(1000);                         // Wait for sensor to stabilize
    dht.begin();
    Serial.println("DHT22 Initialized.");
}

SensorData collectSensorData() {
    SensorData data;

    mpu.getAcceleration(&data.ax, &data.ay, &data.az);
    mpu.getRotation(&data.gx, &data.gy, &data.gz);

    data.h3lis_ax = h3lis.readAccX();
    data.h3lis_ay = h3lis.readAccY();
    data.h3lis_az = h3lis.readAccZ();

    while (gpsSerial.available() > 0) {
        gps.encode(gpsSerial.read());
        if (gps.location.isUpdated() && gps.location.isValid()) {
            lastLatitude = gps.location.lat();
            lastLongitude = gps.location.lng();
        }
    }

    data.latitude = lastLatitude;
    data.longitude = lastLongitude;

    float accX = data.ax / 16384.0;
    float accY = data.ay / 16384.0;
    float accZ = data.az / 16384.0;
    float accMagnitude = sqrt(accX * accX + accY * accY + accZ * accZ);
    float gyroX = data.gx / 131.0;
    float gyroY = data.gy / 131.0;
    float gyroZ = data.gz / 131.0;
    float gyroMagnitude = sqrt(gyroX * gyroX + gyroY * gyroY + gyroZ * gyroZ);

    if (accMagnitude > 1.0 || gyroMagnitude > 1.0) {
        digitalWrite(MQ2_POWER_PIN, LOW);
        delay(100);
        int gasValue = analogRead(MQ2_PIN);
        data.gasPPM = map(gasValue, 0, 4095, 0, 1000);
    } else {
        digitalWrite(MQ2_POWER_PIN, HIGH);
        data.gasPPM = 0.0;
    }

    // Read DHT22 data
    data.temperature = dht.readTemperature();
    data.humidity = dht.readHumidity();

    if (isnan(data.temperature) || isnan(data.humidity)) {
        Serial.println("Failed to read from DHT22 sensor!");
        data.temperature = 0.0;
        data.humidity = 0.0;
    }

    return data;
}
