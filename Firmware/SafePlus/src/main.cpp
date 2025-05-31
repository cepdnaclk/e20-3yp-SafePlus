#include "sensors.h"
#include <ArduinoJson.h>
#include <Wire.h>
#include "wifi_manager.h"
#include "aws_manager.h"
#include "fall_detection.h"
GyroHistory gyroHistory;



#define BUZZER_PIN 13
#define BUTTON_PIN 32
#define MQ2_POWER_PIN 27
#define SIM800L_PIN 26 

// AWS MQTT Setup
const char* awsTopic = "helmet/data";
unsigned long lastTimepublish = 0;
unsigned long publishtimeThreshold = 2000;
const char helmetID[] = "Helmet_1";

void activateBuzzer() {
  Serial.println("BUZZER ON!");
  digitalWrite(BUZZER_PIN, HIGH);  
  delay(1000);                     
  digitalWrite(BUZZER_PIN, LOW);   
}

bool checkButtonPress() {
    static bool lastButtonState = HIGH;
    bool buttonState = digitalRead(BUTTON_PIN);

    if (buttonState == LOW && lastButtonState == HIGH) {
        Serial.println("Button Pressed! Sending message...");
        return true;
    }

    lastButtonState = buttonState;
    return false;
}

void callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("Message received from AWS on topic: ");
    Serial.println(topic);

    String message;
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    Serial.println("Message: " + message);

    if (message == "ALERT") {
        activateBuzzer();
    }
}

void publishData() {
    SensorData data = collectSensorData();
    bool buttonPressed = checkButtonPress();

    float bpm = getHeartRate();

    float accX = data.ax / 16384.0;  
    float accY = data.ay / 16384.0;
    float accZ = data.az / 16384.0;

    float gyroX = data.gx / 131.0;   
    float gyroY = data.gy / 131.0;
    float gyroZ = data.gz / 131.0;

    float accMagnitude = sqrt(accX * accX + accY * accY + accZ * accZ);
    float gyroMagnitude = sqrt(gyroX * gyroX + gyroY * gyroY + gyroZ * gyroZ);

bool impactDetected = detectFall(data, gyroHistory);

    char message[256];
   
    snprintf(message, sizeof(message),
        "{\"id\":\"%s\",\"acc\":%.2f,\"gyr\":%.2f,\"bpm\":%.1f,\"loc\":[%.6f,%.6f],\"gas\":%.1f,\"btn\":%s,\"imp\":\"%s\"}",
        helmetID, accMagnitude, gyroMagnitude, bpm,
        data.latitude, data.longitude, data.gasPPM,
        buttonPressed ? "true" : "false", impactDetected ? "impact" : "no");

    if (data.gasPPM > 900) {
        Serial.println("High gas detected! Activating buzzer...");
        activateBuzzer();
    }

    unsigned publishnow = millis();
    if (buttonPressed || impactDetected) {
        if (impactDetected) activateBuzzer();
        awsPublish(awsTopic, message);
        lastTimepublish = publishnow;
    } else if (publishnow - lastTimepublish > publishtimeThreshold) {
        awsPublish(awsTopic, message);
        lastTimepublish = publishnow;
    }
}

void setup() {
    Serial.begin(115200);
    Serial.println("ESP32 Starting...");
    pinMode(WIFI_LED_PIN, OUTPUT);

    initSensors();
    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW);
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    pinMode(MQ2_POWER_PIN, OUTPUT);
    digitalWrite(MQ2_POWER_PIN, LOW);
    pinMode(SIM800L_PIN, OUTPUT);
    digitalWrite(SIM800L_PIN,HIGH);
    

    initHeartRateSensor();
    wifiInit();
    server.begin();
    awsInit();
}

void loop() {
    wifiLoop();    // Handle WiFi connection & AP web server

    if (isWiFiConnected()) {
        if (!awsIsConnected()) {
            awsConnect(); 
        }
        client.loop(); 
        publishData();
    }

    if (Serial.available() > 0) {
        String input = Serial.readStringUntil('\n');
        input.trim();
        if (input == "ALERT") activateBuzzer();
    }

    delay(10);  // Tune this if needed
}
