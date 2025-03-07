
#include "aws_mqtt.h"
#include "sensors.h"
#include <ArduinoJson.h>
#define BUZZER_PIN 5
#define BUTTON_PIN 33

// AWS MQTT Setup
const char* awsTopic = "helmet/data";
unsigned long lastTimepublish = 0;
unsigned long publishtimeThreshold = 2000;

void activateBuzzer() {
  Serial.println("BUZZER ON!");
  digitalWrite(BUZZER_PIN, HIGH);  
  delay(1000);                     
  digitalWrite(BUZZER_PIN, LOW);   
}
bool checkButtonPress() {
    static bool lastButtonState = HIGH;
    bool buttonState = digitalRead(BUTTON_PIN);

    if (buttonState == LOW && lastButtonState == HIGH) {  // Detect button press
        Serial.println("Button Pressed! Sending message...");
        activateBuzzer();  
        // Create JSON message
        StaticJsonDocument<100> doc;
        doc["button_pushed"] = true;

        char message[100];
        serializeJson(doc, message);
        return true;
    }

    lastButtonState = buttonState;  // Update last state
    return false;
}
void callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("Message received from AWS on topic: ");
    Serial.println(topic);
    
    // Convert payload to string
    String message;
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    Serial.println("Message: " + message);
    StaticJsonDocument<256> doc;
    const char* aws_message = doc["message"];
    Serial.println(" aws message: " + String(aws_message));

    // Check if the message is "ALERT" to turn on the buzzer
    if (message == "ALERT") {
        activateBuzzer();
    }
}

void setup() {
    Serial.begin(115200);
    Serial.println("ESP32 Starting...");
    initSensors();
     pinMode(BUZZER_PIN,OUTPUT);
     digitalWrite(BUZZER_PIN,LOW);
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    initAWS();
    client.setCallback(callback);  // Set AWS IoT message callback
    client.subscribe("helmet/message"); 
}


void publishData() {
    SensorData data = collectSensorData();
    bool buttonPressed = checkButtonPress();

    float accX = data.ax / 16384.0;  
    float accY = data.ay / 16384.0;
    float accZ = data.az / 16384.0;

    float gyroX = data.gx / 131.0;   
    float gyroY = data.gy / 131.0;
    float gyroZ = data.gz / 131.0;

    float accMagnitude = sqrt(accX * accX + accY * accY + accZ * accZ);
    float gyroMagnitude = sqrt(gyroX * gyroX + gyroY * gyroY + gyroZ * gyroZ);

    bool impactDetected = (accMagnitude > 2.0 || gyroMagnitude > 200.0);

    float bpm = (data.irValue < 50000) ? 0 : data.irValue / 1000.0;

    char message[256];
    snprintf(message, sizeof(message),
        "{\"temperature\": %.2f, \"humidity\": %.2f, \"acc_magnitude\": %.2f, \"gyro_magnitude\": %.2f, \"heart_rate\": %.2f, \"location\": {\"lat\": %.6f, \"lng\": %.6f}, \"gasvalues\": %.2f, \"button\": %s, \"impact\": \"%s\"}",
        data.temperature, data.humidity, accMagnitude, gyroMagnitude, bpm, data.latitude, data.longitude, data.gasPPM,
        buttonPressed ? "true" : "false", impactDetected ? "impact" : "no impact");

    // High gas detection logic
    if (data.gasPPM > 900) {  // Adjust threshold based on testing
        Serial.println("High gas detected! Activating buzzer...");
        activateBuzzer();
    }

    // ** Publish Data to AWS IoT **
    unsigned publishnow = millis();
    if (buttonPressed||impactDetected)
    {
        if (impactDetected)
        {
            activateBuzzer();
        }
        
        publishMessage(awsTopic, message);
        lastTimepublish = publishnow;
    }
    else {
        if (publishnow - lastTimepublish > publishtimeThreshold) {
            publishMessage(awsTopic, message);
            lastTimepublish = publishnow;
        }
    }
}


void loop() {
    if (!client.connected()) {
        connectAWS();
        client.subscribe("helemt/message");
    }
    client.loop();
    publishData();
    
    if(Serial.available()>0){
      String input = Serial.readStringUntil('\n');
      input.trim();
      if (input == "ALERT"){
        activateBuzzer();
      }
    }
    delay(100);
}

