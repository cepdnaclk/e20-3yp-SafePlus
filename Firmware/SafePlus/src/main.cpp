#include "sensors.h"
#include <ArduinoJson.h>
#include <Wire.h>
#include "wifi_manager.h"
#include "aws_manager.h"
#include "fall_detection.h"
#include "sim800l_manager.h"

GyroHistory gyroHistory;
AccelHistory accHistory;
FallStateMachine fallSM;
AdaptiveThresholds thresholds;
ConstructionContext context;
ActivityClassifier classifier;

// ------------------------ Pin Definitions ------------------------
#define BUZZER_PIN 13
#define BUTTON_PIN 32
#define MQ2_POWER_PIN 26
#define SIM800L_PIN 27
#define BATTERY_ADC_PIN 35 

// ------------------------ Constants & Globals ---------------------
const char* awsTopic = "helmet/data";
const char* helmetID = "Helmet_1";
unsigned long lastTimePublish = 0;
unsigned long publishThreshold = 2000;
bool usingSIM800L = false;

// **FALL/IMPACT ALERT DURATION VARIABLES**
static bool fallAlertActive = false;
static bool impactAlertActive = false;
static unsigned long fallAlertStartTime = 0;
static unsigned long impactAlertStartTime = 0;
static const unsigned long ALERT_DURATION = 5000;  // 5 seconds
static const unsigned long ALERT_PUBLISH_INTERVAL = 500;  // Publish every 500ms during alert
static unsigned long lastAlertPublish = 0;

// Enhanced Battery Monitoring Constants
const float MAX_BATTERY_VOLTAGE = 4.2;  // Fully charged Li-Po
const float MIN_BATTERY_VOLTAGE = 3.0;  // Minimum safe voltage
const float VOLTAGE_DIVIDER_RATIO = 2.0; // Adjust based on your actual resistor values
const int BATTERY_SAMPLES = 10;          // Number of samples for averaging
const float CRITICAL_BATTERY_VOLTAGE = 3.2; // Critical voltage threshold
const float LOW_BATTERY_VOLTAGE = 3.5;   // Low voltage threshold

// Battery monitoring variables
static unsigned long lastBatteryCheck = 0;
static int lastBatteryPercentage = 100;
static float lastBatteryVoltage = 4.2;
static String lastBatteryStatus = "Excellent";

// ------------------------ Utility Functions (MOVED UP) -----------------------
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

void activateBuzzer() {
    Serial.println("BUZZER ON!");
    digitalWrite(BUZZER_PIN, HIGH);
    delay(1000);
    digitalWrite(BUZZER_PIN, LOW);
}

void gasAlertPattern() {
    for (int i = 0; i < 10; i++) {
        digitalWrite(BUZZER_PIN, HIGH);
        delay(100);
        digitalWrite(BUZZER_PIN, LOW);
        delay(100);
    }
    delay(1000);
}

// ------------------------ Enhanced Battery Functions -----------------------
float readBatteryVoltage() {
    long sum = 0;
    
    // Take multiple samples for better accuracy
    for (int i = 0; i < BATTERY_SAMPLES; i++) {
        sum += analogRead(BATTERY_ADC_PIN);
        delay(10);
    }
    
    float avgRaw = sum / (float)BATTERY_SAMPLES;
    
    // Convert to voltage (ESP32 ADC reference is typically 3.3V)
    float voltage = (avgRaw / 4095.0) * 3.3;
    
    // Apply voltage divider correction
    return voltage * VOLTAGE_DIVIDER_RATIO;
}

int getBatteryPercentage() {
    float voltage = readBatteryVoltage();
    
    // Constrain voltage to expected range
    voltage = constrain(voltage, MIN_BATTERY_VOLTAGE, MAX_BATTERY_VOLTAGE);
    
    // Use a more accurate Li-Po discharge curve
    float percentage;
    
    if (voltage >= 4.1) {
        percentage = 100;
    } else if (voltage >= 3.9) {
        percentage = 80 + (voltage - 3.9) * 100;  // 80-100% (3.9V-4.1V)
    } else if (voltage >= 3.7) {
        percentage = 60 + (voltage - 3.7) * 100;  // 60-80% (3.7V-3.9V)
    } else if (voltage >= 3.5) {
        percentage = 40 + (voltage - 3.5) * 100;  // 40-60% (3.5V-3.7V)
    } else if (voltage >= 3.3) {
        percentage = 20 + (voltage - 3.3) * 75;   // 20-40% (3.3V-3.5V)
    } else if (voltage >= 3.1) {
        percentage = 5 + (voltage - 3.1) * 75;    // 5-20% (3.1V-3.3V)
    } else {
        percentage = 0;
    }
    
    return constrain((int)percentage, 0, 100);
}

String getBatteryStatus() {
    int percentage = getBatteryPercentage();
    
    String status;
    if (percentage >= 80) {
        status = "Excellent";
    } else if (percentage >= 60) {
        status = "Good";
    } else if (percentage >= 40) {
        status = "Fair";
    } else if (percentage >= 20) {
        status = "Low";
    } else {
        status = "Critical";
    }
    
    return status;
}

bool isBatteryCharging() {
    // Simple charging detection - check if voltage is increasing
    static float lastVoltageCheck = 0;
    static unsigned long lastVoltageTime = 0;
    
    float currentVoltage = readBatteryVoltage();
    unsigned long currentTime = millis();
    
    if (currentTime - lastVoltageTime > 5000) { // Check every 5 seconds
        bool charging = (currentVoltage > lastVoltageCheck + 0.05); // 50mV increase
        lastVoltageCheck = currentVoltage;
        lastVoltageTime = currentTime;
        return charging;
    }
    
    return false;
}

void lowBatteryAlert() {
    Serial.println("⚠️ LOW BATTERY WARNING!");
    for (int i = 0; i < 3; i++) {
        digitalWrite(BUZZER_PIN, HIGH);
        delay(200);
        digitalWrite(BUZZER_PIN, LOW);
        delay(200);
    }
}

void criticalBatteryAlert() {
    Serial.println("🚨 CRITICAL BATTERY! SYSTEM SHUTDOWN IMMINENT!");
    for (int i = 0; i < 5; i++) {
        digitalWrite(BUZZER_PIN, HIGH);
        delay(100);
        digitalWrite(BUZZER_PIN, LOW);
        delay(100);
    }
}

void monitorBatteryHealth() {
    if (millis() - lastBatteryCheck > 30000) { // Check every 30 seconds
        lastBatteryCheck = millis();
        
        int currentPercentage = getBatteryPercentage();
        float voltage = readBatteryVoltage();
        String status = getBatteryStatus();
        bool charging = isBatteryCharging();
        
        // Store current values
        lastBatteryPercentage = currentPercentage;
        lastBatteryVoltage = voltage;
        lastBatteryStatus = status;
        
        // Log battery status
        Serial.printf("Battery: %d%% (%.2fV) - %s %s\n", 
                     currentPercentage, voltage, status.c_str(), 
                     charging ? "[CHARGING]" : "");
        
        // Low battery alerts
        if (currentPercentage <= 15 && lastBatteryPercentage > 15) {
            lowBatteryAlert();
        }
        
        // Critical battery alert
        if (currentPercentage <= 5 && lastBatteryPercentage > 5) {
            criticalBatteryAlert();
        }
    }
}

// ------------------------ Alert Management Functions -----------------------
void startFallAlert() {
    if (!fallAlertActive) {
        fallAlertActive = true;
        fallAlertStartTime = millis();
        Serial.println("🚨 FALL ALERT STARTED - Will send for 5 seconds!");
        sosPattern();  // Play SOS pattern when fall detected
    }
}

void startImpactAlert() {
    if (!impactAlertActive) {
        impactAlertActive = true;
        impactAlertStartTime = millis();
        Serial.println("💥 IMPACT ALERT STARTED - Will send for 5 seconds!");
        doubleBeep();  // Play double beep when impact detected
    }
}

void checkAlertStatus() {
    unsigned long currentTime = millis();
    
    // Check if fall alert should expire
    if (fallAlertActive && (currentTime - fallAlertStartTime > ALERT_DURATION)) {
        fallAlertActive = false;
        Serial.println("Fall alert expired");
    }
    
    // Check if impact alert should expire
    if (impactAlertActive && (currentTime - impactAlertStartTime > ALERT_DURATION)) {
        impactAlertActive = false;
        Serial.println("Impact alert expired");
    }
}

bool isInAlertMode() {
    return fallAlertActive || impactAlertActive;
}

bool checkButtonPress() {
    static bool lastState = HIGH;
    static bool latched = false;
    static unsigned long latchStartTime = 0;

    bool currentState = digitalRead(BUTTON_PIN);

    // Button just pressed
    if (currentState == LOW && lastState == HIGH) {
        activateBuzzer();
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

    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, message);

    if (error) {
        Serial.print("deserializeJson() failed: ");
        Serial.println(error.c_str());
        return;
    }

    const char* alert = doc["alert"];
    if (alert && String(alert) == "ALERT") {
        sosPattern();
    }

    handleIncomingCommand(message);
}

// ------------------------ Enhanced Data Collection & Publishing -----------------------
String collectSensorDataAsJson(bool& buttonPressed, bool& impactDetected, bool& fallDetected, bool& gasDetected) {
    SensorData data = collectSensorData();
    float bpm = getHeartRate();
    
    // Enhanced battery data collection
    int batteryPercentage = getBatteryPercentage();
    String batteryStatus = getBatteryStatus();

    // Process sensor data
    float accX = data.ax / 16384.0, accY = data.ay / 16384.0, accZ = data.az / 16384.0;
    float gyroX = data.gx / 131.0, gyroY = data.gy / 131.0, gyroZ = data.gz / 131.0;
    float accMag = sqrt(accX * accX + accY * accY + accZ * accZ);
    float gyroMag = sqrt(gyroX * gyroX + gyroY * gyroY + gyroZ * gyroZ);

    // **ENHANCED Fall/Impact Detection with Alert Management**
    bool currentFallDetected = advancedFallDetection(
        data, 
        data.h3lis_ax, data.h3lis_ay, data.h3lis_az,
        gyroHistory, accHistory, 
        fallSM, thresholds, context, classifier
    );

    // Impact analysis
    ImpactAnalysis impact = analyzeCombinedImpact(data, data.h3lis_ax, data.h3lis_ay, data.h3lis_az);
    bool currentImpactDetected = (impact.severity != "no" && data.h3lisValid);

    // **Start alerts if new detection occurs**
    if (currentFallDetected && !fallAlertActive) {
        startFallAlert();
    }
    
    if (currentImpactDetected && !impactAlertActive) {
        startImpactAlert();
    }

    // **Set return values based on alert status**
    fallDetected = fallAlertActive;
    impactDetected = impactAlertActive;

    buttonPressed = checkButtonPress();
    String gasType = data.gasType;
    gasDetected = !(gasType == "Safe" || gasType == "Warming" || gasType == "No Motion");

    // **Add alert timing information to JSON**
    unsigned long alertTimeRemaining = 0;
    if (fallAlertActive) {
        alertTimeRemaining = ALERT_DURATION - (millis() - fallAlertStartTime);
    } else if (impactAlertActive) {
        alertTimeRemaining = ALERT_DURATION - (millis() - impactAlertStartTime);
    }

    // Enhanced JSON payload with alert info
    char message[600]; // Increased buffer size
    snprintf(message, sizeof(message),
        "{"
        "\"id\":\"%s\","
        "\"temp\":%.1f,"
        "\"hum\":%.1f,"
        "\"bpm\":%.1f,"
        "\"loc\":[%.6f,%.6f],"
        "\"gas\":%.1f,"
        "\"typ\":\"%s\","
        "\"btn\":%s,"
        "\"imp\":\"%s\","
        "\"fall\":%s,"
        "\"battery\":{"
            "\"percentage\":%d,"
            "\"status\":\"%s\""
        "}"
        "}",
        helmetID, data.temperature, data.humidity, accMag, gyroMag, bpm,
        data.latitude, data.longitude, data.gasPPM, data.gasType.c_str(),
        buttonPressed ? "true" : "false", impact.severity.c_str(),
        fallDetected ? "true" : "false",
        batteryPercentage, batteryStatus.c_str());

    return String(message);
}

void publishData() {
    bool buttonPressed = false, impactDetected = false, fallDetected = false, gasDetected = false;
    String json = collectSensorDataAsJson(buttonPressed, impactDetected, fallDetected, gasDetected);

    unsigned long now = millis();
    
    // Check for low battery condition to force publish
    bool lowBattery = (getBatteryPercentage() <= 15);
    
    // **Enhanced publishing logic for alerts**
    bool shouldPublish = false;
    
    // Normal conditions
    if (buttonPressed || gasDetected || lowBattery) {
        shouldPublish = true;
    }
    
    // Alert mode - publish more frequently
    if (isInAlertMode()) {
        if (now - lastAlertPublish > ALERT_PUBLISH_INTERVAL) {
            shouldPublish = true;
            lastAlertPublish = now;
        }
    }
    
    // Normal publishing interval
    if (now - lastTimePublish > publishThreshold) {
        shouldPublish = true;
    }
    
    if (shouldPublish) {
        Serial.println("Publishing data to AWS...");
        
        if (gasDetected) {
            Serial.println("Gas detected! Activating buzzer...");
            gasAlertPattern();
        }

        if (buttonPressed) {
            Serial.println("Button pressed! Activating buzzer...");
        }
        
        if (lowBattery) {
            Serial.println("Low battery detected! Publishing urgent data...");
        }
        
        if (fallDetected) {
            Serial.println("🚨 FALL ALERT ACTIVE! Publishing fall data...");
        }
        
        if (impactDetected) {
            Serial.println("💥 IMPACT ALERT ACTIVE! Publishing impact data...");
        }
        
        awsPublish(awsTopic, json.c_str());
        
        // Update last publish time only for normal intervals
        if (!isInAlertMode()) {
            lastTimePublish = now;
        }
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
    Serial.println("ESP32 Construction Helmet Safety System Starting...");

    pinMode(BUZZER_PIN, OUTPUT);
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    pinMode(MQ2_POWER_PIN, OUTPUT);
    pinMode(SIM800L_PIN, OUTPUT);
    pinMode(BATTERY_ADC_PIN, INPUT);
    
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(MQ2_POWER_PIN, LOW);
    digitalWrite(SIM800L_PIN, HIGH);
    analogReadResolution(12);

    wifiInit();
    awsInit();
    initSensors();
    client.setCallback(callback);
    initHeartRateSensor();
    server.begin();
    
    // Initial battery check
    Serial.printf("Initial Battery Status: %d%% (%.2fV) - %s\n", 
                 getBatteryPercentage(), readBatteryVoltage(), getBatteryStatus().c_str());
}

void loop() {
    wifiLoop();
    
    // **Check and update alert status**
    checkAlertStatus();
    
    // Monitor battery health
    monitorBatteryHealth();

    if (millis() % 1000 == 0) {  // Print every second
        SensorData data = collectSensorData();
        float mpuMag = sqrt(pow(data.ax/16384.0, 2) + pow(data.ay/16384.0, 2) + pow(data.az/16384.0, 2));
        float h3lisMag = sqrt(pow(data.h3lis_ax, 2) + pow(data.h3lis_ay, 2) + pow(data.h3lis_az, 2));
        float gyroMag = sqrt(pow(data.gx/131.0, 2) + pow(data.gy/131.0, 2) + pow(data.gz/131.0, 2));
        
        Serial.printf("DEBUG - MPU: %.2f, H3LIS: %.2f, Gyro: %.2f", mpuMag, h3lisMag, gyroMag);
        
        // **Show alert status**
        if (isInAlertMode()) {
            Serial.printf(" [ALERT MODE: Fall=%s, Impact=%s]", 
                         fallAlertActive ? "ACTIVE" : "OFF", 
                         impactAlertActive ? "ACTIVE" : "OFF");
        }
        Serial.println();
    }
    
    if (isWiFiConnected()) {
        if (!awsIsConnected()) {
            awsConnect();
            client.subscribe("helmet/alert");
        } 
        client.loop();
        publishData();
    } else if (usingSIM800L) {
        bool btn = false, impact = false, fall = false, gas = false;
        String payload = collectSensorDataAsJson(btn, impact, fall, gas);
        sendDataToLambda(payload);
    }

    if (Serial.available() > 0) {
        String input = Serial.readStringUntil('\n');
        input.trim();
        if (input == "ALERT") {
            sosPattern();
        } else if (input == "BATTERY") {
            Serial.printf("Battery Status: %d%% (%.2fV) - %s %s\n", 
                         getBatteryPercentage(), readBatteryVoltage(), 
                         getBatteryStatus().c_str(), 
                         isBatteryCharging() ? "[CHARGING]" : "");
        } else if (input == "FALL") {
            Serial.println("Manual fall alert triggered!");
            startFallAlert();
        } else if (input == "IMPACT") {
            Serial.println("Manual impact alert triggered!");
            startImpactAlert();
        }
    }

    delay(10);
}
