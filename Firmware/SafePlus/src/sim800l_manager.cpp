// SIM800L fallback: init + basic HTTP POST to Lambda when WiFi fails.
#include "sim800l_manager.h"
#include <HardwareSerial.h>
#define SIM800_TX 17
#define SIM800_RX 16
#define SIM800_RST 5
#define SIM800_PWR_PIN 27

HardwareSerial sim800(2);
bool simInitialized = false;

const String lambdaURL = "https://7knwh5q2l2.execute-api.eu-north-1.amazonaws.com/helemtData";  

void sim800PowerOn() {
    digitalWrite(SIM800_PWR_PIN, HIGH);
    delay(1000);
}

void sim800PowerOff() {
    digitalWrite(SIM800_PWR_PIN, HIGH);
    delay(500);
    simInitialized = false;
}

void sim800Init() {
    if (simInitialized) return;

    sim800.begin(9600);
    delay(1000);

    sim800.println("AT");                 // Basic attention test
    delay(500);
    sim800.println("AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\""); // Set bearer type
    delay(500);
    sim800.println("AT+SAPBR=3,1,\"APN\",\"mobitel\""); // TODO: make APN configurable
    sim800.println("AT+SAPBR=1,1");          // Open bearer
    delay(3000);

    simInitialized = true;
}

bool sendDataToLambda(const String& payload) {
    // Basic HTTP POST sequence (terminates any previous session first)
    sim800.println("AT+HTTPTERM");  // Ensure clean state
    delay(500);
    sim800.println("AT+HTTPINIT");  // Initialize HTTP service
    delay(1000);
    sim800.println("AT+HTTPPARA=\"CID\",1"); // Use bearer profile 1
    delay(500);

    sim800.println("AT+HTTPPARA=\"URL\",\"" + lambdaURL + "\""); // Target endpoint
    delay(1000);
    sim800.println("AT+HTTPPARA=\"CONTENT\",\"application/json\""); // JSON content type
    delay(500);
    
    // Upload body length then payload
    sim800.print("AT+HTTPDATA=");
    sim800.print(payload.length());
    sim800.println(",10000");            // 10s timeout for data entry
    delay(500);
    sim800.print(payload);
    delay(1000);

    sim800.println("AT+HTTPACTION=1");  // Execute HTTP POST
    delay(6000);                        // Wait for network transaction

    sim800.println("AT+HTTPREAD");     // Read (ignore content for now)
    delay(1000);

    return true;  // TODO: Parse +HTTPACTION response for status code
}

void sim800Loop()
{
}
