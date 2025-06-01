#include "sensors.h"
#include <ArduinoJson.h>
#include <Wire.h>
#include "wifi_manager.h"
#include "aws_manager.h"
#include "fall_detection.h"
#include "sim800l_manager.h"

GyroHistory gyroHistory;

// ------------------------ Pin Definitions ------------------------
#define BUZZER_PIN 13
#define BUTTON_PIN 32
#define MQ2_POWER_PIN 27
#define SIM800L_PIN 26
#define BATTERY_ADC_PIN 35 

// ------------------------ Constants & Globals ---------------------
const char* awsTopic = "helmet/data";
const char* helmetID = "Helmet_1";
unsigned long lastTimePublish = 0;
unsigned long publishThreshold = 2000;
bool usingSIM800L = false;
const float MAX_BATTERY_VOLTAGE = 4.2;
const float MIN_BATTERY_VOLTAGE = 3.0;
const float VOLTAGE_DIVIDER_RATIO = 2.0;

// ------------------------ Utility Functions -----------------------
void activateBuzzer() {
    Serial.println("BUZZER ON!");
    digitalWrite(BUZZER_PIN, HIGH);
    delay(1000);
    digitalWrite(BUZZER_PIN, LOW);
}

bool checkButtonPress() {
    static bool lastState = HIGH;
    bool currentState = digitalRead(BUTTON_PIN);

    if (currentState == LOW && lastState == HIGH) {
        Serial.println("Button Pressed! Sending message...");
        lastState = currentState;
        return true;
    }

    lastState = currentState;
    return false;
}

void callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("Message received from AWS topic: ");
    Serial.println(topic);
    String message;
    for (unsigned int i = 0; i < length; i++) message += (char)payload[i];
    Serial.println("Message: " + message);
    if (message == "ALERT") activateBuzzer();
}

float readBatteryVoltage() {
    int raw = analogRead(BATTERY_ADC_PIN);
    float voltage = (raw / 4095.0) * 3.3;             // ADC to volts (based on 3.3V ref)
    return voltage * VOLTAGE_DIVIDER_RATIO;          // Scale up due to voltage divider
}

int getBatteryPercentage() {
    float voltage = readBatteryVoltage();
    voltage = constrain(voltage, MIN_BATTERY_VOLTAGE, MAX_BATTERY_VOLTAGE);
    int percentage = (int)(((voltage - MIN_BATTERY_VOLTAGE) /
                            (MAX_BATTERY_VOLTAGE - MIN_BATTERY_VOLTAGE)) * 100.0);
    return constrain(percentage, 0, 100);
}


// ------------------------ Data Collection & Publishing -----------------------
String collectSensorDataAsJson(bool& buttonPressed, bool& impactDetected) {
    SensorData data = collectSensorData();
    float bpm = getHeartRate();
    int battery = getBatteryPercentage();

    float accX = data.ax / 16384.0, accY = data.ay / 16384.0, accZ = data.az / 16384.0;
    float gyroX = data.gx / 131.0, gyroY = data.gy / 131.0, gyroZ = data.gz / 131.0;

    float accMag = sqrt(accX * accX + accY * accY + accZ * accZ);
    float gyroMag = sqrt(gyroX * gyroX + gyroY * gyroY + gyroZ * gyroZ);

    impactDetected = detectFall(data, gyroHistory);
    buttonPressed = checkButtonPress();

    if (data.gasPPM > 900) {
        Serial.println("High gas detected! Activating buzzer...");
        activateBuzzer();
    }

    char message[256];
    snprintf(message, sizeof(message),
        "{\"id\":\"%s\",\"temp\":%.1f,\"hum\":%.1f,\"acc\":%.2f,\"gyr\":%.2f,\"bpm\":%.1f,\"loc\":[%.6f,%.6f],\"gas\":%.1f,\"btn\":%s,\"imp\":\"%s\",\"floor\":%d,\"alt\":%.1f}",
        helmetID, data.temperature, data.humidity, accMag, gyroMag, bpm,
        data.latitude, data.longitude, data.gasPPM,
        buttonPressed ? "true" : "false", impactDetected ? "impact" : "no",
        data.floorLevel, data.altitude);

    return String(message);
}

void publishData() {
    bool buttonPressed = false, impactDetected = false;
    String json = collectSensorDataAsJson(buttonPressed, impactDetected);

    unsigned long now = millis();
    if (buttonPressed || impactDetected || (now - lastTimePublish > publishThreshold)) {
        if (impactDetected) activateBuzzer();
        awsPublish(awsTopic, json.c_str());
        lastTimePublish = now;
    }
}

// ------------------------ Network Switching -----------------------
void handleNetworkSwitching() {
    static unsigned long lastCheck = 0;
    if (millis() - lastCheck < 5000) return;
    lastCheck = millis();

    if (isWiFiConnected()) {
        if (usingSIM800L) {
            sim800PowerOff();
            usingSIM800L = false;
            Serial.println("WiFi restored. Switched back to WiFi + MQTT.");
        }
    } else {
        if (!usingSIM800L) {
            Serial.println("WiFi lost. Switching to SIM800L.");
            sim800PowerOn();
            delay(3000);
            sim800Init();
            usingSIM800L = true;
        }
    }
}

// ------------------------ Setup & Loop -----------------------
void setup() {
    Serial.begin(115200);
    Serial.println("ESP32 Starting...");

    pinMode(BUZZER_PIN, OUTPUT);
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    pinMode(MQ2_POWER_PIN, OUTPUT);
    pinMode(SIM800L_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(MQ2_POWER_PIN, LOW);
    digitalWrite(SIM800L_PIN, HIGH);
    analogReadResolution(12); 
    pinMode(BATTERY_ADC_PIN, INPUT);

    wifiInit();
    awsInit();
    initSensors();
    initHeartRateSensor();
    server.begin();
}

void loop() {
    wifiLoop();
    handleNetworkSwitching();
    if (isWiFiConnected()) {
        if (!awsIsConnected()) awsConnect();
        client.loop();
        publishData();
    } else if (usingSIM800L) {
        bool btn = false, impact = false;
        String payload = collectSensorDataAsJson(btn, impact);
        sendDataToLambda(payload);  // SIM800L HTTP POST
    }

    if (Serial.available() > 0) {
        String input = Serial.readStringUntil('\n');
        input.trim();
        if (input == "ALERT") activateBuzzer();
    }

    delay(10);  // Smooth loop
}
