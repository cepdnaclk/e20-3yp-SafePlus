import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header/Header";
import HelmetMap from "../MapComp/HelmetMap";
import WorkerCard from "../components/WorkerCard/WorkerCard";

export default function LiveData() {
  const [helmetSensorMap, setHelmetSensorMap] = useState({});
  const [helmetLocations, setHelmetLocations] = useState({});
  const [assignedWorkers, setAssignedWorkers] = useState([]);

  // Fetch assigned workers
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/workers/assigned")
      .then((res) => setAssignedWorkers(res.data))
      .catch((err) =>
        console.error("❌ Failed to fetch assigned workers", err)
      );
  }, []);

  // WebSocket: Listen for real-time helmet data
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8085");

    ws.onopen = () => console.log("✅ WS connected");

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        console.log("📩 New data:", data);

        if (data.id) {
          setHelmetSensorMap((prev) => ({
            ...prev,
            [data.id]: data,
          }));
        }

        if (data.id && data.loc?.[0] != null && data.loc?.[1] != null) {
          setHelmetLocations((prev) => ({
            ...prev,
            [data.id]: [data.loc[0], data.loc[1]],
          }));
        }
      } catch (err) {
        console.error("❌ WS parse error:", err);
      }
    };

    ws.onclose = () => console.log("❌ WS closed");
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  return (
    <div>
      <Header />
      <div style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
        {/* Worker Cards */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            overflowY: "auto",
            maxHeight: "80vh",
          }}
        >
          {assignedWorkers.map((worker) => (
            <WorkerCard
              key={worker.helmetId}
              worker={worker}
              sensorData={helmetSensorMap[worker.helmetId]}
            />
          ))}
        </div>

        {/* Map */}
        <div
          style={{
            flex: 1,
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <HelmetMap helmetLocations={helmetLocations} zoom={8} />
        </div>
      </div>
    </div>
  );
}
