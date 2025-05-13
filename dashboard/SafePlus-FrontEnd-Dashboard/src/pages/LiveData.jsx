import { useState, useEffect } from "react";
import Header from "../components/Header/Header";
import IotCoreComponent from "../IotCoreComponent";
import HelmetMap from "../MapComp/HelmetMap";

const defaultLocation = [6.9271, 79.8612];

export default function LiveData() {
  const [sensorData, setSensorData]     = useState(null);
  const [helmetLocation, setHelmetLocation] = useState(defaultLocation);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8085");
    ws.onopen    = () => console.log("✅ WS connected");
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        console.log("📩 New data:", data);
        setSensorData(data);

        if (data.loc?.loc[0] != null && data.loc?.loc[1] != null) {
          setHelmetLocation([data.loc.loc[0], data.loc.loc[1]]);
        }
      } catch (err) {
        console.error("❌ WS parse error:", err);
      }
    };
    ws.onclose = () => console.log("❌ WS closed");
    return () => ws.close();
  }, []);

  return (
    <div>
      <Header />
      <h2 style={{ textAlign: "center", margin: "1rem 0" }}>Live Feed</h2>

      <div style={{
        display: "flex",
        gap: "1rem",
        padding: "1rem",
      }}>
        {/* Sensor Data Panel */}
        <div style={{
          flex: 1,
          backgroundColor: "#f9f9f9",
          padding: "1rem",
          borderRadius: "8px",
        }}>
          <IotCoreComponent sensorData={sensorData} />
        </div>

        {/* Map Panel */}
        <div style={{
          flex: 1,
          borderRadius: "8px",
          overflow: "hidden",
        }}>
            <HelmetMap location={helmetLocation} zoom ={8} />

        </div>
      </div>
    </div>
  );
}