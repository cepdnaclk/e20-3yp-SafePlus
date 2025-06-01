#include "sensors.h"
#include "MAX30105.h"
#include "heartRate.h"
#include <Wire.h>
#include <MPU6050.h>
#include <TinyGPS++.h>
#include <DFRobot_LIS.h>
#include <DHT.h>
#include <Adafruit_BMP280.h>  

#define MQ2_PIN 34
#define MQ2_POWER_PIN 27
#define RXD2 16
#define TXD2 17
#define GPS_BAUD 9600

#define DHTPIN 4
#define DHT_POWER_PIN 33
#define DHTTYPE DHT22
#define RL_VALUE 9.7
#define VCC 5.0
#define ADC_RESOLUTION 4095.0
#define SEA_LEVEL_PRESSURE_HPA 1013.25

MPU6050 mpu;
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);
DFRobot_H3LIS200DL_I2C h3lis(&Wire, 0x18);
Adafruit_BMP280 bmp;  // BMP280 sensor

MAX30105 particleSensor;
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute;
int beatAvg;
double lastLatitude = 0.0;
double lastLongitude = 0.0;
float referenceAltitude = 0.0;
bool isAltitudeCalibrated = false;
float LPGCurve[3] = {2.3, 0.21, -0.47};    // LPG
float COCurve[3]  = {2.3, 0.72, -0.34};    // CO
float SmokeCurve[3] = {2.3, 0.53, -0.44};  // Smoke

float R0 = 10.0;
bool mq2Calibrated = false;



DHT dht(DHTPIN, DHTTYPE);

float getSensorResistance() {
  digitalWrite(MQ2_POWER_PIN, HIGH);  // power ON sensor
  delay(100);                        // sensor warm-up

  int adcValue = analogRead(MQ2_PIN);
  if (adcValue == 0) adcValue = 1;  // avoid division by zero

  float vout = (adcValue * VCC) / ADC_RESOLUTION;
  float rs = ((VCC - vout) * RL_VALUE) / vout;

  digitalWrite(MQ2_POWER_PIN, LOW);  // power OFF sensor to save energy
  return rs;
}

// Calibrate R0 in clean air (average of multiple readings)
float calibrateMQ2() {
  float r0 = 0.0;
  int samples = 50;

  for (int i = 0; i < samples; i++) {
    float rs = getSensorResistance();
    r0 += rs;
    delay(100);
  }
  r0 /= samples;
  
  // According to datasheet RS/R0 ~ 9.83 in clean air for LPG
  r0 /= 9.83;
  return r0;
}

// Calculate gas PPM from Rs/R0 ratio using curve {x, y, slope}
float getGasPPM(float ratio, float *pcurve) {
  return pow(10, ((log10(ratio) - pcurve[1]) / pcurve[2]) + pcurve[0]);
}


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
    if (irValue < 50000) return 0;

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

    // MPU6050
    mpu.initialize();
    if (!mpu.testConnection()) Serial.println("MPU6050 connection failed!");
    else Serial.println("MPU6050 Initialized.");

    // GPS
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
    Serial.println("Calibrating MQ2 sensor...");
    R0 = calibrateMQ2();
    Serial.print("MQ2 Calibration complete. R0 = ");
    Serial.print(R0);
    Serial.println(" kΩ");
    mq2Calibrated = true;

    // DHT22
    pinMode(DHT_POWER_PIN, OUTPUT);
    digitalWrite(DHT_POWER_PIN, LOW);
    delay(1000);
    dht.begin();
    Serial.println("DHT22 Initialized.");

    // BMP280 setup
if (bmp.begin(0x76)) {
    referenceAltitude = bmp.readAltitude(SEA_LEVEL_PRESSURE_HPA);
    isAltitudeCalibrated = true;

    Serial.print("Calibrated Reference Altitude (Ground Floor): ");
    Serial.println(referenceAltitude);
}

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
        if(mq2Calibrated) {
            float rs = getSensorResistance();
            float ratio = rs / R0;
            float lpgPPM = getGasPPM(ratio, LPGCurve);
            float coPPM = getGasPPM(ratio, COCurve);
            float smokePPM = getGasPPM(ratio, SmokeCurve); 
            data.gasPPM = max(lpgPPM, max(coPPM, smokePPM));
            Serial.print("MQ2 RS: ");
            Serial.print(rs);
            Serial.print(" kΩ, Ratio: ");
            Serial.print(ratio);
            Serial.print(", LPG PPM: ");
            Serial.print(lpgPPM);
            Serial.print(", CO PPM: ");
            Serial.print(coPPM);
            Serial.print(", Smoke PPM: ");
            Serial.println(smokePPM);

        } else {
            data.gasPPM = 0.0;
            Serial.println("MQ2 not calibrated, gas PPM set to 0.");
        }
        
    } else {
        digitalWrite(MQ2_POWER_PIN, HIGH);
        data.gasPPM = 0.0;
    }

    data.temperature = dht.readTemperature();
    data.humidity = dht.readHumidity();
    if (isnan(data.temperature) || isnan(data.humidity)) {
        Serial.println("Failed to read from DHT22 sensor!");
        data.temperature = 0.0;
        data.humidity = 0.0;
    }

    // --- BMP280 altitude and floor logic ---
if (isAltitudeCalibrated) {
    float currentAltitude = bmp.readAltitude(SEA_LEVEL_PRESSURE_HPA);
    float relativeHeight = currentAltitude - referenceAltitude;
    float workingHeight = relativeHeight - 1.6764;  
    int floorLevel = max((int)(workingHeight / 3.0), 0);

    data.altitude = workingHeight;
    data.floorLevel = floorLevel;
} else {
    data.altitude = 0.0;
    data.floorLevel = 0;
}


    return data;
}
