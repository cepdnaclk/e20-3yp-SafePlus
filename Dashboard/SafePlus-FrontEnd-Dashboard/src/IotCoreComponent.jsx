import { useEffect, useState } from "react";

const IotCoreComponent = () => {
  const [sensorData, setSensorData] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8085");

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
          <p><strong>📊 Acceleration:</strong> {sensorData.acc_magnitude} g</p>
          <p><strong>🌀 Gyro:</strong> {sensorData.gyro_magnitude} °/s</p>
          <p><strong>☢️ Gas:</strong> {sensorData.gasvalues} ppm</p>

          {/* Impact Box */}
          <div style={{
            marginTop: "20px", 
            padding: "15px", 
            borderRadius: "8px", 
            backgroundColor: sensorData.impact === "impact" ? "#f8d7da" : "#d4edda", 
            color: sensorData.impact === "impact" ? "#721c24" : "#155724", 
            border: `1px solid ${sensorData.impact === "impact" ? "#f5c6cb" : "#c3e6cb"}`,
            textAlign: "center"
          }}>
            <h3>Impact : {sensorData.impact === "impact" ? "🚨 Impact Detected" : "👍 Safe"}</h3>
          </div>

          <div style={{
            marginTop: "20px", 
            padding: "15px", 
            borderRadius: "8px", 
            backgroundColor: sensorData.gasvalues?.gas > 900 ? "#f8d7da" : "#d4edda", 
            color: sensorData.gasvalues?.gas > 900 ? "#721c24" : "#155724", 
            border: `1px solid ${sensorData.gasvalues > 900 ? "#f5c6cb" : "#c3e6cb"}`,
            textAlign: "center"
          }}>
            <h3>Gas Level: {sensorData.gasvalues > 900 ? "☠️ High Gas Detected" : "👍 Gas Levels Normal"}</h3>
          </div>
          <div style={{ marginTop: "20px" ,
            padding: "15px",
            borderRadius: "8px",
            backgroundColor: sensorData.button === true ? "#f8d7da" : "#d4edda",
            color: sensorData.button === true ? "#721c24" : "#155724",
            border: `1px solid ${sensorData.button === true ? "#f5c6cb" : "#c3e6cb"}`,
            textAlign: "center"
          }}>
            <h3> {sensorData.button === true ? "🚨 SOS alert" :""}</h3>
          </div>
        </div>
      ) : (
        <p style={{ color: "#6c757d" }}>⏳ Waiting for data...</p>
      )}
    </div>
  );
};

export default IotCoreComponent;
