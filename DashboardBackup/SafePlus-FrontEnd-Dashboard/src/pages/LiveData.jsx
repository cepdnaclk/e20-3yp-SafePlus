import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Header from "../components/Header/Header";
import HelmetMap from "../MapComp/HelmetMap";
import WorkerCard from "../components/WorkerCard/WorkerCard";
import { HighlightProvider } from "../context/HighlightContext"; // import context provider

// Get API and WebSocket URLs from environment variables
const API_URL = process.env.REACT_APP_API_URL;
const WS_URL = process.env.REACT_APP_WS_URL;

export default function LiveData() {
  const [helmetSensorMap, setHelmetSensorMap] = useState({});
  const [helmetLocations, setHelmetLocations] = useState({});
  const [assignedWorkers, setAssignedWorkers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedHelmetId, setSelectedHelmetId] = useState(null);
  const ws = useRef(null);

  // Fetch assigned workers
  useEffect(() => {
    axios
      .get(`${API_URL}/api/workers/assigned`)
      .then((res) => setAssignedWorkers(res.data))
      .catch((err) =>
        console.error("❌ Failed to fetch assigned workers", err)
      );
  }, []);

  const sendNotification = ({ id, message, onClick, remove }) => {
    if (remove) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      return;
    }
    if (!notifications.some(n => n.id === id)) {
      setNotifications(prev => [...prev, { id, message, onClick }]);
    }
  };

  // WebSocket: Listen for real-time helmet data
  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => console.log("✅ WS connected");

    ws.current.onmessage = (evt) => {
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

    ws.current.onclose = () => console.log("❌ WS closed");

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  return (
    <HighlightProvider>
      <div>
        <Header />
        <div style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
          <div className="notification-panel">
            {notifications.map(n => (
              <div
                key={n.id}
                className="notification"
                onClick={() => n.onClick?.()}
              >
                {n.message}
              </div>
            ))}
            </div>
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
                sendNotification={sendNotification}
                onClick={() => setSelectedHelmetId(worker.helmetId)}
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
            <HelmetMap helmetLocations={helmetLocations} zoom={13} />
          </div>
        </div>
      </div>
    </HighlightProvider>
  );
}
