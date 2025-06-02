#include "wifi_manager.h"

WiFiCredentials wifiCreds[MAX_WIFI_CREDENTIALS];
WebServer server(80);
int currentCredentialIndex = 0;

unsigned long previousMillis = 0;
const long slowBlinkInterval = 1000;
const long fastBlinkInterval = 100;
bool ledState = LOW;

bool wifiConnected = false;
bool wifiStable = false;

unsigned long wifiConnectStartTime = 0;
const unsigned long wifiConnectTimeout = 5000; // 5 sec per SSID attempt

int nextIndexToWrite = 0;

void clearEEPROM() {
  Serial.println("Clearing EEPROM...");
  for (int i = 0; i < EEPROM_SIZE; i++) {
    EEPROM.write(i, 0);
  }
  EEPROM.commit();
  Serial.println("EEPROM cleared.");
}

// EEPROM helper functions (same as your original)
void readCredentialsFromEEPROM() {
  nextIndexToWrite = 0;
  for (int i = 0; i < MAX_WIFI_CREDENTIALS; i++) {
    int baseAddr = i * EEPROM_BLOCK_SIZE;
    EEPROM.get(baseAddr, wifiCreds[i]);
  }
  for (int i = 0; i < MAX_WIFI_CREDENTIALS; i++) {
    if (strlen(wifiCreds[i].ssid) == 0) {
      nextIndexToWrite = i;
      break;
    }
  }
}

void saveCredentialToEEPROM(int index, const WiFiCredentials &cred) {
  int baseAddr = index * EEPROM_BLOCK_SIZE;
  EEPROM.put(baseAddr, cred);
  EEPROM.commit();
}

void addNewCredential(const char* ssid, const char* password) {
  strncpy(wifiCreds[nextIndexToWrite].ssid, ssid, sizeof(wifiCreds[nextIndexToWrite].ssid) - 1);
  wifiCreds[nextIndexToWrite].ssid[sizeof(wifiCreds[nextIndexToWrite].ssid) - 1] = 0;
  strncpy(wifiCreds[nextIndexToWrite].password, password, sizeof(wifiCreds[nextIndexToWrite].password) - 1);
  wifiCreds[nextIndexToWrite].password[sizeof(wifiCreds[nextIndexToWrite].password) - 1] = 0;

  saveCredentialToEEPROM(nextIndexToWrite, wifiCreds[nextIndexToWrite]);
  Serial.printf("Saved new credential at slot %d: SSID='%s'\n", nextIndexToWrite, wifiCreds[nextIndexToWrite].ssid);

  nextIndexToWrite++;
  if (nextIndexToWrite >= MAX_WIFI_CREDENTIALS) nextIndexToWrite = 0;
}

void startAP() {
  WiFi.softAP("Helmet_1_Setup", "12345678");
  Serial.println("Started Access Point: HelmetSetup");
  Serial.print("AP IP address: ");
  Serial.println(WiFi.softAPIP());
}

void handleWifiConfig() {
  if (server.method() == HTTP_POST) {
    String ssid;
    String password;

    // Try parsing as JSON
    if (server.hasArg("plain")) {
      StaticJsonDocument<256> doc;
      DeserializationError error = deserializeJson(doc, server.arg("plain"));

      if (!error) {
        ssid = doc["ssid"].as<String>();
        password = doc["password"].as<String>();
      }
    }

    if (ssid.length() == 0 && server.hasArg("ssid")) {
      ssid = server.arg("ssid");
      password = server.arg("password");
    }

    if (ssid.length() == 0) {
      server.send(400, "application/json", "{\"status\":\"SSID cannot be empty\"}");
      return;
    }

    addNewCredential(ssid.c_str(), password.c_str());

    server.send(200, "application/json", "{\"status\":\"OK\"}");
    delay(1000);
    ESP.restart();
  } else {
    // Serve the HTML form
    server.send(200, "text/html", R"rawliteral(
      <!DOCTYPE html><html><body>
      <h3>Enter WiFi Credentials</h3>
      <form method="POST" action="/wifi">
        SSID: <input name="ssid"><br>
        Password: <input name="password"><br>
        <input type="submit" value="Submit">
      </form>
      </body></html>
    )rawliteral");
  }
}


void tryNextWiFiCredential() {
  if (currentCredentialIndex >= MAX_WIFI_CREDENTIALS) {
    currentCredentialIndex = 0;
  }

  WiFiCredentials &cred = wifiCreds[currentCredentialIndex];

  if (strlen(cred.ssid) == 0) {
    Serial.printf("Slot %d empty. Skipping...\n", currentCredentialIndex);
    currentCredentialIndex++;
    return;
  }

  Serial.printf("Trying to connect to SSID #%d: %s\n", currentCredentialIndex, cred.ssid);

  WiFi.disconnect(true);
  delay(100);
  WiFi.begin(cred.ssid, cred.password);
  wifiConnectStartTime = millis();
}

void wifiInit() {
  EEPROM.begin(EEPROM_SIZE);
  //clearEEPROM();
  readCredentialsFromEEPROM();
  pinMode(WIFI_LED_PIN, OUTPUT);
  startAP();
  server.on("/wifi", handleWifiConfig);
  tryNextWiFiCredential();
}

bool isWiFiConnected() {
  return (WiFi.status() == WL_CONNECTED);
}

void wifiLoop() {
  server.handleClient();

  unsigned long currentMillis = millis();

  if (isWiFiConnected()) {
    if (!wifiConnected) {
      Serial.println("WiFi connected!");
    }
    wifiConnected = true;

    int32_t rssi = WiFi.RSSI();
    wifiStable = (rssi > -70);

  } else {
    wifiConnected = false;
    wifiStable = false;

    if ((wifiConnectStartTime == 0) || (currentMillis - wifiConnectStartTime > wifiConnectTimeout)) {
      currentCredentialIndex++;
      if (currentCredentialIndex >= MAX_WIFI_CREDENTIALS) currentCredentialIndex = 0;
      tryNextWiFiCredential();
    }
  }

  if (!wifiConnected) {
    // Fast blink LED while trying to connect
    if (currentMillis - previousMillis >= fastBlinkInterval) {
      previousMillis = currentMillis;
      ledState = !ledState;
      digitalWrite(WIFI_LED_PIN, ledState);
    }
  } else if (wifiConnected && !wifiStable) {
    // Slow blink LED for unstable connection
    if (currentMillis - previousMillis >= slowBlinkInterval) {
      previousMillis = currentMillis;
      ledState = !ledState;
      digitalWrite(WIFI_LED_PIN, ledState);
    }
  } else {
    // Solid ON for stable connection
    digitalWrite(WIFI_LED_PIN, HIGH);
  }
}
