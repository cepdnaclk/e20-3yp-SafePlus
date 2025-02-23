import React, { useEffect, useState } from "react";

const IotCoreComponent = () => {
  const [sensorData, setSensorData] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8084");

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

    ws.onclose = () => console.log("❌ WebSocket Connection Closed");

    return () => ws.close();
  }, []);

  return (
    <div style={{
      maxWidth: "500px", 
      margin: "50px auto", 
      padding: "20px", 
      borderRadius: "10px", 
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", 
      backgroundColor: "#f8f9fa", 
      textAlign: "center"
    }}>
      <h2 style={{ color: "#007bff" }}>📡 Real-Time Sensor Data</h2>

      {sensorData ? (
        <div style={{ textAlign: "left", padding: "10px" }}>
          <p><strong>🌡️ Temperature:</strong> {sensorData.temperature} °C</p>
          <p><strong>💧 Humidity:</strong> {sensorData.humidity} %</p>
          <p><strong>❤️ Heart Rate:</strong> {sensorData.heart_rate} bpm</p>
          <p><strong>📊 Acceleration:</strong> X: {sensorData.accel?.x}, Y: {sensorData.accel?.y}, Z: {sensorData.accel?.z}</p>
          <p><strong>🌀 Gyro:</strong> X: {sensorData.gyro?.x}, Y: {sensorData.gyro?.y}, Z: {sensorData.gyro?.z}</p>
          <p><strong>☢️ Gas :</strong> {sensorData.gasvalues?.gas} ppm</p>
        </div>
      ) : (
        <p style={{ color: "#6c757d" }}>⏳ Waiting for data...</p>
      )}
    </div>
  );
};

export default IotCoreComponent;
