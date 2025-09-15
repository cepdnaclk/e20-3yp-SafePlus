// AWS IoT minimal manager: cert load, blocking connect, simple publish.
#include "aws_manager.h"
#include "secrate.h"  // AWS certs and endpoint

namespace {
  // Wait duration (ms) before another connection attempt if MQTT connect fails
  constexpr unsigned long AWS_RETRY_DELAY_MS = 5000;
  // MQTT client ID (static here; could append chip ID for multi-device scenarios)
  constexpr const char* AWS_CLIENT_ID = "ESP32_Client";
}

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
    if (client.connect(AWS_CLIENT_ID)) {
      Serial.println("Connected to AWS IoT!");
    } else {
      Serial.print("AWS connection failed, retrying...");
      delay(AWS_RETRY_DELAY_MS); // simple blocking retry (keeps code easy to follow)
    }
  }
}

void awsPublish(const char* topic, const char* message) {
  // NOTE: publish() here is synchronous; if QoS > 0 or confirmation needed,
  // integrate a callback or check client.loop() responsiveness.
  if (client.publish(topic, message)) {
    Serial.println("Data sent: " + String(message));
  } else {
    Serial.println("Failed to publish message");
  }
}

bool awsIsConnected() {
  return client.connected();
}
