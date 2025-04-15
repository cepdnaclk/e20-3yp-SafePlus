#ifndef AWS_MQTT_H
#define AWS_MQTT_H

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <Arduino.h>
#include <PubSubClient.h>

// Function declarations
void initAWS();
void connectWiFi();
void connectAWS();
void publishMessage(const char* topic, const char* message);

extern WiFiClientSecure espClient;
extern PubSubClient client;

#endif // AWS_MQTT_H
