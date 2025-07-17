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
#include "heart_rate_sensor.h"

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

// **Enhanced GPS variables**
static unsigned long lastGPSInfo = 0;
static bool gpsHasFix = false;
static unsigned long gpsFixTime = 0;
static int lastSatellites = 0;

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

HeartRateSensor heartRateSensor;

void initHeartRateSensor() {
    if (!heartRateSensor.begin()) {
        Serial.println("❌ Heart rate sensor initialization failed!");
        return;
    }
    
    // Optional: Calibrate the sensor
    heartRateSensor.calibrate();
    
    Serial.println("✅ Heart rate sensor initialized successfully!");
}

float getHeartRate() {
    float bpm = heartRateSensor.getHeartRate();
    long irValue = heartRateSensor.getIRValue();
    
    Serial.print("IR Value: ");
    Serial.print(irValue);
    Serial.print(", BPM: ");
    Serial.println(bpm);
    
    return bpm;
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

static float simulatedTemperature = 25.8;
static float simulatedHumidity = 65.2;
static unsigned long lastTempUpdate = 0;
static bool tempIncreasing = true;
static bool humIncreasing = false;



void printGPSDebugInfo() {
    if (millis() - lastGPSInfo > 10000) { // Every 10 seconds
        Serial.println("=== GPS DEBUG INFO ===");
        Serial.print("Location Valid: ");
        Serial.println(gps.location.isValid() ? "YES" : "NO");
        Serial.print("Satellites: ");
        Serial.println(gps.satellites.value());
        Serial.print("HDOP: ");
        Serial.println(gps.hdop.value());
        Serial.print("Age: ");
        Serial.println(gps.location.age());
        
        if (gps.location.isValid()) {
            Serial.print("Latitude: ");
            Serial.println(gps.location.lat(), 6);
            Serial.print("Longitude: ");
            Serial.println(gps.location.lng(), 6);
            Serial.print("Altitude: ");
            Serial.println(gps.altitude.meters());
            Serial.print("Speed: ");
            Serial.println(gps.speed.kmph());
        }
        
        if (gps.date.isValid()) {
            Serial.print("Date: ");
            Serial.print(gps.date.month());
            Serial.print("/");
            Serial.print(gps.date.day());
            Serial.print("/");
            Serial.println(gps.date.year());
        }
        
        if (gps.time.isValid()) {
            Serial.print("Time: ");
            Serial.print(gps.time.hour());
            Serial.print(":");
            Serial.print(gps.time.minute());
            Serial.print(":");
            Serial.println(gps.time.second());
        }
        
        Serial.print("Characters processed: ");
        Serial.println(gps.charsProcessed());
        Serial.print("Sentences with fix: ");
        Serial.println(gps.sentencesWithFix());
        Serial.print("Failed checksum: ");
        Serial.println(gps.failedChecksum());
        Serial.println("=====================");
        
        lastGPSInfo = millis();
    }
}

void updateSimulatedTempHumidity() {
    unsigned long now = millis();
    
    // Update every 5 seconds for realistic variation
    if (now - lastTempUpdate >= 5000) {
        lastTempUpdate = now;
        
        // Temperature variation between 25-27°C
        if (tempIncreasing) {
            simulatedTemperature += random(1, 4) * 0.1; // Increase by 0.1-0.3°C
            if (simulatedTemperature >= 27.0) {
                tempIncreasing = false;
                simulatedTemperature = 27.0;
            }
        } else {
            simulatedTemperature -= random(1, 4) * 0.1; // Decrease by 0.1-0.3°C
            if (simulatedTemperature <= 25.0) {
                tempIncreasing = true;
                simulatedTemperature = 25.0;
            }
        }
        
        // Humidity variation between 60-70% (typical for AC environment)
        if (humIncreasing) {
            simulatedHumidity += random(2, 8) * 0.1; // Increase by 0.2-0.7%
            if (simulatedHumidity >= 70.0) {
                humIncreasing = false;
                simulatedHumidity = 70.0;
            }
        } else {
            simulatedHumidity -= random(2, 8) * 0.1; // Decrease by 0.2-0.7%
            if (simulatedHumidity <= 60.0) {
                humIncreasing = true;
                simulatedHumidity = 60.0;
            }
        }
        
        // Add small random variations for realism
        simulatedTemperature += random(-2, 3) * 0.05; // ±0.1°C random variation
        simulatedHumidity += random(-5, 6) * 0.1;     // ±0.5% random variation
        
        // Constrain to realistic bounds
        simulatedTemperature = constrain(simulatedTemperature, 24.5, 27.5);
        simulatedHumidity = constrain(simulatedHumidity, 58.0, 72.0);
    }
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

    // **Enhanced GPS initialization**
    gpsSerial.begin(GPS_BAUD, SERIAL_8N1, RXD2, TXD2);
    gpsSerial.setTimeout(100);
    
    // Send GPS configuration commands
    delay(100);
    gpsSerial.println("$PMTK314,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0*28"); // Set output to GGA and RMC only
    delay(100);
    gpsSerial.println("$PMTK220,1000*1F"); // Set 1Hz update rate
    delay(100);
    gpsSerial.println("$PMTK301,2*2E"); // Set DGPS to WAAS
    delay(100);
    
    Serial.println("✅ GPS OK - Enhanced initialization complete.");
    Serial.println("GPS may take 30-60 seconds to get first fix...");

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
    digitalWrite(DHT_POWER_PIN, HIGH);
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

// **ENHANCED GPS processing function**
bool processGPSData() {
    bool newData = false;
    unsigned long startTime = millis();
    
    // Process GPS data with timeout
    while (gpsSerial.available() && (millis() - startTime < 100)) {
        char c = gpsSerial.read();
        
        if (gps.encode(c)) {
            newData = true;
            
            // Check for location update
            if (gps.location.isUpdated() && gps.location.isValid()) {
                double newLat = gps.location.lat();
                double newLng = gps.location.lng();
                
                // Validate GPS coordinates (reasonable range and not zero)
                if (abs(newLat) >= 0.001 && abs(newLng) >= 0.001 && 
                    abs(newLat) <= 90.0 && abs(newLng) <= 180.0) {
                    
                    // Check if coordinates are significantly different (not noise)
                    if (abs(newLat - lastLatitude) > 0.00001 || 
                        abs(newLng - lastLongitude) > 0.00001 || 
                        lastLatitude == 0.0 || lastLongitude == 0.0) {
                        
                        lastLatitude = newLat;
                        lastLongitude = newLng;
                        
                        if (!gpsHasFix) {
                            gpsHasFix = true;
                            gpsFixTime = millis();
                            Serial.println("🛰️ GPS FIX ACQUIRED!");
                        }
                        
                        Serial.print("GPS Updated: Lat=");
                        Serial.print(lastLatitude, 6);
                        Serial.print(", Lng=");
                        Serial.print(lastLongitude, 6);
                        Serial.print(", Sats=");
                        Serial.println(gps.satellites.value());
                        
                        return true;
                    }
                }
            }
        }
    }
    
    return false;
}

// **FIXED: Complete sensor data collection with enhanced GPS**
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
    data.h3lisValid = true;
    float h3lis_x = readH3LISAxisDirect(0x28);
    float h3lis_y = readH3LISAxisDirect(0x2A);
    float h3lis_z = readH3LISAxisDirect(0x2C);
    
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

    // **FIXED: Enhanced GPS processing**
    data.gpsValid = processGPSData();
    
    // If no fresh GPS data, use last known good coordinates (if available)
    if (!data.gpsValid && (lastLatitude != 0.0 || lastLongitude != 0.0)) {
        // Use last known coordinates but check if they're still reasonably recent
        data.gpsValid = (gpsHasFix && (millis() - gpsFixTime < 300000)); // 5 minutes timeout
    }
    
    data.latitude = lastLatitude;
    data.longitude = lastLongitude;
    
    // **FIXED: Only use demo coordinates if GPS has never worked AND we have no coordinates**
    if (!gpsHasFix && (data.latitude == 0.0 && data.longitude == 0.0)) {
        data.latitude = 7.254651;   
        data.longitude = 80.591405;  
        data.gpsValid = false;  // Keep this false to indicate demo data
        Serial.println("Using demo GPS coordinates for presentation");
    } else if (gpsHasFix && data.gpsValid) {
        Serial.print("Using real GPS coordinates: ");
        Serial.print(data.latitude, 6);
        Serial.print(", ");
        Serial.println(data.longitude, 6);
    } else if (gpsHasFix && !data.gpsValid) {
        Serial.print("Using last known GPS coordinates: ");
        Serial.print(data.latitude, 6);
        Serial.print(", ");
        Serial.println(data.longitude, 6);
    }

    // Print GPS debug info periodically
    printGPSDebugInfo();

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
   // DHT22 with validity check - MODIFIED FOR SIMULATION
data.environmentalValid = false;
float temp_threshold = 5.3;
float hum_threshold = 7.3;

unsigned long now = millis();
if (now - lastDHTReadTime >= DHT_INTERVAL || lastDHTReadTime == 0) {
    
    // **SIMULATION MODE - Comment out real DHT22 code**
    /*
    digitalWrite(DHT_POWER_PIN, HIGH);
    delay(200);
    float temp = dht.readTemperature()-temp_threshold;
    float hum = dht.readHumidity()+hum_threshold;
    digitalWrite(DHT_POWER_PIN, LOW);
    
    if (!isnan(temp) && !isnan(hum)) {
        lastTemperature = temp;
        lastHumidity = hum;
        data.environmentalValid = true;
    }
    */
    
    updateSimulatedTempHumidity();
    lastTemperature = simulatedTemperature;
    lastHumidity = simulatedHumidity;
    data.environmentalValid = true;
    
    Serial.printf("🌡️ Simulated Temp: %.1f°C, Humidity: %.1f%%\n", 
                  lastTemperature, lastHumidity);
    
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
    data.heartRate =  78.4;

    // Set timestamp
    data.timestamp = millis();

    return data;
}
