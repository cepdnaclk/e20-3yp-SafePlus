import React, { useEffect, useState } from "react";
import WorkerCard from "../components/WorkerCard/WorkerCard";
import axios from "axios";

export default function AssignedWorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [sensorDataMap, setSensorDataMap] = useState({});
  const [liveSensorData, setLiveSensorData] = useState({});

  // Fetch assigned workers
  useEffect(() => {
    axios
      .get("http://localhost:8001/api/workers/assigned")
      .then((res) => setWorkers(res.data))
      .catch((err) => console.error("Error fetching assigned workers:", err));
  }, []);

  // Connect to WebSocket for live sensor data
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8085");

    ws.onopen = () => console.log("✅ WebSocket connected");
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.id) {
          setLiveSensorData((prev) => ({
            ...prev,
            [data.id]: data,
          }));
        }
      } catch (error) {
        console.error("❌ Failed to parse WebSocket message:", error);
      }
    };

    ws.onclose = () => console.log("❌ WebSocket closed");
    return () => ws.close();
  }, []);

  // Generate dummy sensor data for all workers (every 3s)
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = {};
      workers.forEach((worker) => {
        newData[worker.helmetId] = {
          tmp: (20 + Math.random() * 10).toFixed(1),
          hum: (30 + Math.random() * 30).toFixed(1),
          bpm: Math.floor(60 + Math.random() * 40),
          acc: (Math.random() * 3).toFixed(2),
          gyr: (Math.random() * 180).toFixed(2),
          gas: Math.floor(Math.random() * 1000),
          btn: Math.random() > 0.95,
          imp: Math.random() > 0.9 ? "impact" : "no",
        };
      });
      setSensorDataMap(newData);
    }, 3000);

    return () => clearInterval(interval);
  }, [workers]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🪖 Workers Assigned to Helmets</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {workers.map((worker) => {
          const liveData = liveSensorData[worker.helmetId];
          const fallbackData = sensorDataMap[worker.helmetId] || null;

          return (
            <WorkerCard
              key={worker.nic}
              worker={worker}
              sensorData={liveData?.id === worker.helmetId ? liveData : fallbackData}
            />
          );
        })}
      </div>
    </div>
  );
}
