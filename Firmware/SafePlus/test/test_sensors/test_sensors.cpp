#include <Arduino.h>
#include <unity.h>
#include "sensors.h"

// Setup before running tests
void setUp() {
    initSensors();
}

// Test sensor initialization
// Test sensor data collection
void test_collect_data() {
    SensorData data = collectSensorData();
    TEST_ASSERT_TRUE(data.temperature > -40 && data.temperature < 80);
    TEST_ASSERT_TRUE(data.humidity >= 0 && data.humidity <= 100);
}

// Run tests
void loop() {
    UNITY_BEGIN();
    RUN_TEST(test_collect_data);
    UNITY_END();
}
