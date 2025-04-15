#include "aws_mqtt.h"
#include "secrate.h"

WiFiClientSecure espClient;
PubSubClient client(espClient);
unsigned long timeThreshold = 2000;
unsigned long lastTime = 0;

void initAWS() {
    WiFi.mode(WIFI_STA);
    connectWiFi();
    connectAWS();
}

void connectWiFi() {
    Serial.print("Connecting to WiFi");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected!");
}

void connectAWS() {
    espClient.setCACert(AWS_CERT_CA);
    espClient.setCertificate(AWS_CERT_CRT);
    espClient.setPrivateKey(AWS_CERT_PRIVATE);

    client.setServer(AWS_IOT_ENDPOINT, 8883);
    Serial.println("Connecting to AWS...");

    while (!client.connected()) {
        if (client.connect("ESP32_Client")) {
            Serial.println("Connected to AWS IoT!");
        } else {
            Serial.print("AWS connection failed, retrying...");
            delay(5000);
        }
    }
}

void publishMessage(const char* topic, const char* message) {
    if (client.publish(topic, message)) {
        Serial.println("Data sent: " + String(message));
        unsigned long now = millis();
        if (now - lastTime > timeThreshold) {
            Serial.println("Data sent: " + String(message));
            lastTime = now;
        }
    } else {
        Serial.println("Failed to publish message");
        
    }
}