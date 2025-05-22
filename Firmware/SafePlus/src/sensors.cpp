#include "sensors.h"
#include "MAX30105.h"
#include "heartRate.h"

DHT dht(DHTPIN, DHTTYPE);
MPU6050 mpu;
HardwareSerial gpsSerial(2);
TinyGPSPlus gps;  


// MAX30102 Variables
MAX30105 particleSensor;
const byte RATE_SIZE = 4; 
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute;
int beatAvg;

void initHeartRateSensor() {
    if (!particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
        Serial.println("MAX30102 not found. Check wiring.");
        return;
    }

    particleSensor.setup(); // Use default config: 69us, 50Hz, 411 samples
    particleSensor.setPulseAmplitudeIR(0x30); // IR for HR detection
    particleSensor.setPulseAmplitudeRed(0x0A);
    Serial.println("MAX30102 Initialized.");
}

float getHeartRate() {
    long irValue = particleSensor.getIR();

    if (irValue < 50000) {
        return 0; // Not enough signal
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
    // Initialize DHT22
    dht.begin();
    Serial.println("DHT22 Initialized.");

    // Initialize MPU6050
    Wire.begin(21,22);
    mpu.initialize();
    if (!mpu.testConnection()) {
        Serial.println("MPU6050 connection failed!");
    } else {
        Serial.println("MPU6050 Initialized.");

    }



    // Initialize GPS
    gpsSerial.begin(GPS_BAUD, SERIAL_8N1, RXD2, TXD2);
    Serial.println("GPS Initialized.");
}

SensorData collectSensorData() {
    SensorData data;
    data.temperature = dht.readTemperature();
    data.humidity = dht.readHumidity();

    if (isnan(data.temperature) || isnan(data.humidity)) {
        Serial.println("Failed to read from DHT22!");
        return data;
    }

    mpu.getAcceleration(&data.ax, &data.ay, &data.az);
    mpu.getRotation(&data.gx, &data.gy, &data.gz);

   
    while (gpsSerial.available() > 0) {
        gps.encode(gpsSerial.read());
    }
    data.latitude = gps.location.isValid() ? gps.location.lat() : 0.0;
    data.longitude = gps.location.isValid() ? gps.location.lng() : 0.0;

    int gasValue = analogRead(MQ2_PIN);
    data.gasPPM = map(gasValue, 0,4095,0,1000);

    return data;
}
