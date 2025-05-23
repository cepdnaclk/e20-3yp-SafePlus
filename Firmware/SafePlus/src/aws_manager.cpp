#include "aws_manager.h"
#include "secrate.h"  // Your AWS certs and endpoint

WiFiClientSecure espClient;
PubSubClient client(espClient);

void awsInit() {
  espClient.setCACert(AWS_CERT_CA);
  espClient.setCertificate(AWS_CERT_CRT);
  espClient.setPrivateKey(AWS_CERT_PRIVATE);
  client.setServer(AWS_IOT_ENDPOINT, 8883);
}

void awsConnect() {
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

void awsPublish(const char* topic, const char* message) {
  if (client.publish(topic, message)) {
    Serial.println("Data sent: " + String(message));
  } else {
    Serial.println("Failed to publish message");
  }
}

bool awsIsConnected() {
  return client.connected();
}
