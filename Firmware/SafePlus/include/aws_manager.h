#ifndef AWS_MANAGER_H
#define AWS_MANAGER_H

#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <Arduino.h>

// AWS IoT connection functions
void awsInit();
void awsConnect();
void awsPublish(const char* topic, const char* message);
bool awsIsConnected();

extern WiFiClientSecure espClient;
extern PubSubClient client;

#endif // AWS_MANAGER_H
