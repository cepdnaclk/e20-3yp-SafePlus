import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";

const IotCoreComponent = () => {
  const [sensorData, setSensorData] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://192.168.22.24:8084/"); // Change to your actual WebSocket server

    ws.onopen = () => console.log("✅ Connected to WebSocket Server");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 New Sensor Data:", data);
        setSensorData(data);
      } catch (error) {
        console.error("❌ Error parsing WebSocket message:", error);
      }
    };   

    ws.onerror = (error) => console.error("⚠️ WebSocket Error:", error);
    
    ws.onclose = () => console.log("❌ WebSocket Connection Closed");

    return () => ws.close();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📡 Real-Time Sensor Data</Text>

      {sensorData ? (
        <ScrollView style={styles.dataContainer}>
          <Text style={styles.dataText}>🌡️ <Text style={styles.bold}>Temperature:</Text> {sensorData.temperature} °C</Text>
          <Text style={styles.dataText}>💧 <Text style={styles.bold}>Humidity:</Text> {sensorData.humidity} %</Text>
          <Text style={styles.dataText}>❤️ <Text style={styles.bold}>Heart Rate:</Text> {sensorData.heart_rate} bpm</Text>
          <Text style={styles.dataText}>📊 <Text style={styles.bold}>Acceleration:</Text> X: {sensorData.accel?.x}, Y: {sensorData.accel?.y}, Z: {sensorData.accel?.z}</Text>
          <Text style={styles.dataText}>🌀 <Text style={styles.bold}>Gyro:</Text> X: {sensorData.gyro?.x}, Y: {sensorData.gyro?.y}, Z: {sensorData.gyro?.z}</Text>
          <Text style={styles.dataText}>☢️ <Text style={styles.bold}>Gas:</Text> {sensorData.gasvalues?.gas} ppm</Text>
        </ScrollView>
      ) : (
        <Text style={styles.loadingText}>⏳ Waiting for data...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007bff",
    textAlign: "center",
    marginBottom: 20,
  },
  dataContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  dataText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
  },
});

export default IotCoreComponent;
