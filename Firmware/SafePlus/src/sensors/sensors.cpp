#include "sensors.h"
#include "MAX30105.h"
#include "heartRate.h"
#include <Wire.h>
#include <MPU6050.h>
#include <TinyGPS++.h>
#include <DFRobot_LIS.h>
#include <DHT.h>
#include <Adafruit_BMP280.h>
#include <Preferences.h>



#define MQ2_PIN            34
#define MQ2_POWER_PIN      27
#define RXD2               16
#define TXD2               17
#define GPS_BAUD           9600

#define DHTPIN             4
#define DHT_POWER_PIN      33
#define DHTTYPE            DHT22

#define RL_VALUE           9.7
#define VCC                5.0
#define ADC_RESOLUTION     4095.0
#define SEA_LEVEL_PRESSURE_HPA 1013.25

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
float R0 = 10.0;
bool mq2Calibrated = false;
double lastLatitude = 0.0, lastLongitude = 0.0;
unsigned long lastDHTReadTime = 0;
const unsigned long DHT_INTERVAL = 3 * 60 * 1000; 
float lastTemperature = 0.0;
float lastHumidity = 0.0;
unsigned long mq2LastPowerOnTime = 0;
unsigned long mq2LastReadTime = 0;
const unsigned long MQ2_POWER_ON_INTERVAL = 1 * 60 * 1000UL;
const unsigned long MQ2_WARMUP_TIME = 30000UL;               
const unsigned long MQ2_READING_DURATION = 3*60*1000UL;         
bool mq2IsPowered = false;
float mq2LatestGasPPM = 0.0;


// Curves for gas calculations
float LPGCurve[3]   = {2.3, 0.21, -0.47};
float COCurve[3]    = {2.3, 0.72, -0.34};
float SmokeCurve[3] = {2.3, 0.53, -0.44};

// Power-efficient MQ2 reading
float getSensorResistanceRaw() {
    long sum = 0;
    const int samples = 10;
    for (int i = 0; i < samples; i++) {
        int adcValue = analogRead(MQ2_PIN);
        adcValue = max(adcValue, 1);
        sum += adcValue;
        delay(20);
    }

    float avgAdc = sum / (float)samples;
    float vout = (avgAdc * VCC) / ADC_RESOLUTION;
    float rs = ((VCC - vout) * RL_VALUE) / vout;
    return rs;
}

float calibrateMQ2() {
    float r0 = 0;
    const int samples = 50;

    for (int i = 0; i < samples; i++) {
        r0 += getSensorResistanceRaw();
        delay(100);
    }
    
    return ((r0 / samples) / 9.83);
}

float getGasPPM(float ratio, float *curve) {
    return pow(10, ((log10(ratio) - curve[1]) / curve[2]) + curve[0]);
}

void initHeartRateSensor() {
    if (!particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
        Serial.println("MAX30102 not found.");
        return;
    }

    particleSensor.setup();
    particleSensor.setPulseAmplitudeIR(0x30);
    particleSensor.setPulseAmplitudeRed(0x0A);
    Serial.println("MAX30102 Initialized.");
}

float getHeartRate() {
    long irValue = particleSensor.getIR();
    if (irValue < 50000) return 0;

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

void initSensors() {
    Wire.begin(21, 22);

    // MPU6050
    mpu.initialize();
    if (!mpu.testConnection()) Serial.println("MPU6050 failed!");
    else Serial.println("MPU6050 OK.");

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

    // MQ2
    pinMode(MQ2_POWER_PIN, OUTPUT);
    digitalWrite(MQ2_POWER_PIN, LOW);
    Serial.println("Calibrating MQ2...");
    R0 = calibrateMQ2();
    // R0 = 26.88;
    Serial.print("R0 = "); Serial.println(R0);
    mq2Calibrated = true;

    // DHT22
    pinMode(DHT_POWER_PIN, OUTPUT);
    digitalWrite(DHT_POWER_PIN, LOW);
    dht.begin();


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


SensorData collectSensorData() {
    SensorData data;

    // MPU6050
    mpu.getAcceleration(&data.ax, &data.ay, &data.az);
    mpu.getRotation(&data.gx, &data.gy, &data.gz);

    // H3LIS
    data.h3lis_ax = h3lis.readAccX();
    data.h3lis_ay = h3lis.readAccY();
    data.h3lis_az = h3lis.readAccZ();

    // GPS
    while (gpsSerial.available()) {
        gps.encode(gpsSerial.read());
        if (gps.location.isUpdated() && gps.location.isValid()) {
            lastLatitude = gps.location.lat();
            lastLongitude = gps.location.lng();
        }
    }
    data.latitude = lastLatitude;
    data.longitude = lastLongitude;

    // Motion detection
    float accMag = sqrt(pow(data.ax / 16384.0, 2) +
                        pow(data.ay / 16384.0, 2) +
                        pow(data.az / 16384.0, 2));

    float gyroMag = sqrt(pow(data.gx / 131.0, 2) +
                         pow(data.gy / 131.0, 2) +
                         pow(data.gz / 131.0, 2));

unsigned long now = millis();

    // Check if it's time to power ON the MQ2 heater
    if (!mq2IsPowered && (now - mq2LastPowerOnTime >= MQ2_POWER_ON_INTERVAL || mq2LastPowerOnTime == 0)) {
        digitalWrite(MQ2_POWER_PIN, LOW);  
        mq2IsPowered = true;
        mq2LastPowerOnTime = now;
        Serial.println("MQ2 heater powered ON");
    }

    // If MQ2 is powered, check warm-up and reading window
    if (mq2IsPowered) {
        unsigned long poweredDuration = now - mq2LastPowerOnTime;

        if (poweredDuration >= MQ2_WARMUP_TIME && poweredDuration <= (MQ2_WARMUP_TIME + MQ2_READING_DURATION)) {
            // Warmed up - take readings now

            float rs = getSensorResistanceRaw();
            float ratio = rs / R0;

            float lpgPPM = getGasPPM(ratio, LPGCurve);
            float coPPM = getGasPPM(ratio, COCurve);
            float smokePPM = getGasPPM(ratio, SmokeCurve);

            mq2LatestGasPPM = max(lpgPPM, max(coPPM, smokePPM));
            mq2LastReadTime = now;
        }

        if (poweredDuration > (MQ2_WARMUP_TIME + MQ2_READING_DURATION)) {
            digitalWrite(MQ2_POWER_PIN, HIGH); 
            mq2IsPowered = false;
            Serial.println("MQ2 heater powered OFF");
        }
    }
    data.gasPPM = mq2LatestGasPPM;


    // DHT22
if (now - lastDHTReadTime >= DHT_INTERVAL || lastDHTReadTime == 0) {
    digitalWrite(DHT_POWER_PIN, HIGH);
    delay(200);
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();
    digitalWrite(DHT_POWER_PIN, LOW);
    if (!isnan(temp) && !isnan(hum)) {
        lastTemperature = temp;
        lastHumidity = hum;
    }
    lastDHTReadTime = now;
}

data.temperature = lastTemperature;
data.humidity = lastHumidity;

    // BMP280
    if (isAltitudeCalibrated) {
        float currentAlt = bmp.readAltitude(SEA_LEVEL_PRESSURE_HPA);
        float height = currentAlt - referenceAltitude;
        data.altitude = height;
        data.floorLevel = max(int(height / 3.9), 0);
    } else {
        data.altitude = 0.0;
        data.floorLevel = 0;
    }

    return data;
}
