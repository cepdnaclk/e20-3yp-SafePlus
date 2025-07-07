#include "sim800l_manager.h"
#include <HardwareSerial.h>
#define SIM800_TX 17
#define SIM800_RX 16
#define SIM800_RST 5
#define SIM800_PWR_PIN 26

HardwareSerial sim800(2);
bool simInitialized = false;

const String lambdaURL = "https://7knwh5q2l2.execute-api.eu-north-1.amazonaws.com/helemtData";  

void sim800PowerOn() {
    digitalWrite(SIM800_PWR_PIN, HIGH);
    delay(1000);
}

void sim800PowerOff() {
    digitalWrite(SIM800_PWR_PIN, LOW);
    delay(500);
    simInitialized = false;
}

void sim800Init() {
    if (simInitialized) return;

    sim800.begin(9600);
    delay(1000);

    sim800.println("AT");
    delay(500);
    sim800.println("AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"");
    delay(500);
    sim800.println("AT+SAPBR=3,1,\"APN\",\"mobitel\""); 
    sim800.println("AT+SAPBR=1,1");
    delay(3000);

    simInitialized = true;
}

bool sendDataToLambda(const String& payload) {
    sim800.println("AT+HTTPTERM");
    delay(500);
    sim800.println("AT+HTTPINIT");
    delay(1000);
    sim800.println("AT+HTTPPARA=\"CID\",1");
    delay(500);

    sim800.println("AT+HTTPPARA=\"URL\",\"" + lambdaURL + "\"");
    delay(1000);
    sim800.println("AT+HTTPPARA=\"CONTENT\",\"application/json\"");
    delay(500);
    
    sim800.print("AT+HTTPDATA=");
    sim800.print(payload.length());
    sim800.println(",10000");
    delay(500);
    sim800.print(payload);
    delay(1000);

    sim800.println("AT+HTTPACTION=1");  // POST
    delay(6000);

    sim800.println("AT+HTTPREAD");
    delay(1000);

    return true;  // Could be extended with status parsing
}

void sim800Loop()
{
}
