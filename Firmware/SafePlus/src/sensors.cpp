#include "sensors.h"

DHT dht(DHTPIN, DHTTYPE);
MPU6050 mpu;
MAX30105 particleSensor;
HardwareSerial gpsSerial(2);
TinyGPSPlus gps;  

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

    // Initialize MAX30105
    if (!particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
        Serial.println("MAX30105 not found!");
    } else {
        Serial.println("MAX30105 Initialized.");
        particleSensor.setup();
        particleSensor.setPulseAmplitudeRed(0x1F);
        particleSensor.setPulseAmplitudeIR(0x1F);
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

   data.irValue = particleSensor.getIR();
   
    while (gpsSerial.available() > 0) {
        gps.encode(gpsSerial.read());
    }
    data.latitude = gps.location.isValid() ? gps.location.lat() : 0.0;
    data.longitude = gps.location.isValid() ? gps.location.lng() : 0.0;

    int gasValue = analogRead(MQ2_PIN);
    data.gasPPM = map(gasValue, 0,4095,0,1000);

    return data;
}
