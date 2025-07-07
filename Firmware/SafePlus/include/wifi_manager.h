#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <WiFi.h>
#include <WebServer.h>
#include <EEPROM.h>
#include <ArduinoJson.h>

#define EEPROM_SIZE 512
#define WIFI_LED_PIN 18

#define MAX_WIFI_CREDENTIALS 6
#define EEPROM_BLOCK_SIZE 64

struct WiFiCredentials {
    char ssid[32];
    char password[32];
};

extern WebServer server;
extern int currentCredentialIndex;
extern WiFiCredentials wifiCreds[];

void wifiInit();
bool isWiFiConnected();
void wifiLoop();

#endif // WIFI_MANAGER_H
