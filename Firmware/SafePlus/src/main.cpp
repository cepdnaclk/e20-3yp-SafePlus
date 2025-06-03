#include "sensors.h"
#include <ArduinoJson.h>
#include <Wire.h>
#include "wifi_manager.h"
#include "aws_manager.h"
#include "fall_detection.h"
#include "sim800l_manager.h"

GyroHistory gyroHistory;
AccelHistory accHistory;

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
void sosPattern() {
  // S: dot-dot-dot
  for (int i = 0; i < 3; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(200);
    digitalWrite(BUZZER_PIN, LOW);
    delay(200);
  }
  delay(400);
  // O: dash-dash-dash
  for (int i = 0; i < 3; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(600);
    digitalWrite(BUZZER_PIN, LOW);
    delay(200);
  }
  delay(400);
  // S: dot-dot-dot
  for (int i = 0; i < 3; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(200);
    digitalWrite(BUZZER_PIN, LOW);
    delay(200);
  }
}

void doubleBeep() {
  for (int i = 0; i < 5; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(150);
    digitalWrite(BUZZER_PIN, LOW);
    delay(150);
  }
}



bool checkButtonPress() {
    static bool lastState = HIGH;
    static bool latched = false;
    static unsigned long latchStartTime = 0;

    bool currentState = digitalRead(BUTTON_PIN);

    // Button just pressed
    if (currentState == LOW && lastState == HIGH) {
        Serial.println("Button Pressed! Starting 10s latch...");
        latchStartTime = millis();
        latched = true;
    }

    // Handle latch duration
    if (latched && (millis() - latchStartTime < 10000)) {
        lastState = currentState;
        return true;
    }

    // Latch expired
    latched = false;
    lastState = currentState;
    return false;
}

void callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("Message received from AWS topic: ");
    Serial.println(topic);

    String message;
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }

    Serial.println("Message: " + message);

    if (message == "ALERT") {
        sosPattern();
    }
    handleIncomingCommand(message);
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
String collectSensorDataAsJson(bool& buttonPressed, bool& impactDetected,bool& fallDetected) {
    SensorData data = collectSensorData();
    float bpm = getHeartRate();
    int battery = getBatteryPercentage();

    float accX = data.ax / 16384.0, accY = data.ay / 16384.0, accZ = data.az / 16384.0;
    float gyroX = data.gx / 131.0, gyroY = data.gy / 131.0, gyroZ = data.gz / 131.0;

    float accMag = sqrt(accX * accX + accY * accY + accZ * accZ);
    float gyroMag = sqrt(gyroX * gyroX + gyroY * gyroY + gyroZ * gyroZ);

    fallDetected = detectFall(data, gyroHistory, accHistory);
    buttonPressed = checkButtonPress();
    String gasType = data.gasType;

    String impactType = detectImpactWithH3LIS(data.h3lis_ax, data.h3lis_ay, data.h3lis_az);
    impactDetected = (impactType != "no");



    char message[256];
    snprintf(message, sizeof(message),
        "{\"id\":\"%s\",\"temp\":%.1f,\"hum\":%.1f,\"acc\":%.2f,\"gyr\":%.2f,\"bpm\":%.1f,\"loc\":[%.6f,%.6f],\"gas\":%.1f,\"typ\":\"%s\",\"btn\":%s,\"imp\":\"%s\",\"fall\":%s,\"floor\":%d,\"alt\":%.1f}",
        helmetID, data.temperature, data.humidity, accMag, gyroMag, bpm,
        data.latitude, data.longitude, data.gasPPM,data.gasType.c_str(),
        buttonPressed ? "true" : "false", impactType.c_str(),
        fallDetected ? "true" : "false",
        data.floorLevel, data.altitude);

    return String(message);
}



void publishData() {
    bool buttonPressed = false, impactDetected = false, fallDetected = false;
    String json = collectSensorDataAsJson(buttonPressed, impactDetected, fallDetected);


    unsigned long now = millis();
    if (buttonPressed || impactDetected || fallDetected || (now - lastTimePublish > publishThreshold)) {
        Serial.println("Publishing data to AWS...");
        Serial.println(impactDetected ? "Impact detected!" : "No impact detected.");
        Serial.println(fallDetected ? "Fall detected!" : "No fall detected.");
        if (buttonPressed) {
            Serial.println("Button pressed! Activating buzzer...");
          
        }
        if (impactDetected); //activateBuzzer();
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
    client.setCallback(callback);
    initHeartRateSensor();
    server.begin();
    
}

void loop() {
    wifiLoop();
    //handleNetworkSwitching();
    if (isWiFiConnected()) {
        if (!awsIsConnected()){
            awsConnect();
            client.subscribe("helmet/alert");
        } 
        client.loop();
        publishData();
    } else if (usingSIM800L) {
        bool btn = false, impact = false, fall = false;
        String payload = collectSensorDataAsJson(btn, impact, fall);
        sendDataToLambda(payload);  // SIM800L HTTP POST
    }

    if (Serial.available() > 0) {
        String input = Serial.readStringUntil('\n');
        input.trim();
        if (input == "ALERT") sosPattern();
    }

    delay(10);  // Smooth loop
}
