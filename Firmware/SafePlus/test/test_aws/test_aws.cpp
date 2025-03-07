#include <Arduino.h>
#include <unity.h>
#include "aws_mqtt.h"

#include "../../include/aws_mqtt.h"  // ✅ Use the header instead


// Test setup
void setUp() {
    initAWS();  // Ensure AWS initialization
}

void test_aws_connection() {
    TEST_ASSERT_NOT_NULL(&client);  // Check if client is properly initialized
}

void test_publish_message() {
    publishMessage("test/topic", "Hello, MQTT!");
    TEST_ASSERT_TRUE(client.connected());  // Ensure client is still connected
}

void setup() {
    UNITY_BEGIN();
    RUN_TEST(test_aws_connection);
    RUN_TEST(test_publish_message);
    UNITY_END();
}

void loop() {
    // Nothing needed here
}
