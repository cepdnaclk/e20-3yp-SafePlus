import { useState, useRef, useEffect } from "react";
import { useHighlight } from "../../context/HighlightContext";
import { useNotifications } from "../../context/NotificationContext";
import SOSModal from "../SOSModal/SOSModal";
import "./WorkerCard.css";

export default function WorkerCard({ worker, sensorData, onClick }) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [acknowledgedAlertKey, setAcknowledgedAlertKey] = useState(null);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const { setHighlightedId, setHighlightedGroupIds } = useHighlight();
  const cardRef = useRef(null);
  const { sendNotification } = useNotifications();

  const hasAlert =
    sensorData &&
    (sensorData.bpmStatus === "high" ||
      sensorData.gasStatus === "danger" ||
      sensorData.impactStatus === "warning" ||
      sensorData.tempStatus === "danger" ||
      sensorData.fallStatus === "detected" ||
      sensorData.btn);

  const currentAlertKey = hasAlert
    ? `${worker.id}-${sensorData?.bpmStatus}-${sensorData?.gasStatus}-${sensorData?.impactStatus}-${sensorData?.tempStatus}`
    : null;

  useEffect(() => {
    if (hasAlert && currentAlertKey !== acknowledgedAlertKey) {
      setShowAlert(true);

      if (sendNotification) {
        sendNotification({
          id: worker.id,
          message: `⚠️ Alert triggered for ${worker.name}`,
          onClick: () => {
            const confirmed = window.confirm(`Take action for ${worker.name}?`);
            if (confirmed) {
              setAcknowledgedAlertKey(currentAlertKey);
              sendNotification({ id: worker.id, remove: true });
            }
          },
        });
      }
    }
  }, [
    hasAlert,
    currentAlertKey,
    acknowledgedAlertKey,
    sendNotification,
    worker.id,
    worker.name,
  ]);

  useEffect(() => {
    if (!hasAlert) {
      setAcknowledgedAlertKey(null);
      setShowAlert(false);
    }
  }, [hasAlert]);

  const handleCardClick = () => {
    setShowOverlay(true);
    onClick?.();
  };

  const closeOverlay = () => setShowOverlay(false);

  const handleSOS = () => {
    setShowSOSModal(true); 
  };

  const handleSOSModeSelect = async (mode) => {
  setShowSOSModal(false);

  try {
    const res = await fetch("http://localhost:8000/api/sos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alert: "ALERT",
        helmetId: worker.helmetId,
        mode,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    console.log(`✅ SOS sent to ${mode}`);

    if (mode === "group") {
      const currentLoc = sensorData?.loc;
      const radiusInKm = 0.1;

      // Find group in proximity
      const nearbyIds = Object.entries(sensorData.allHelmetLocations || {})
        .filter(([id, loc]) => {
          if (id === worker.helmetId || !Array.isArray(loc)) return false;
          const dist = haversineDistance(currentLoc, loc);
          return dist <= radiusInKm;
        })
        .map(([id]) => id);

      setHighlightedGroupIds([worker.helmetId, ...nearbyIds]);
    }
  } catch (err) {
    console.error("❌ SOS failed:", err.message);
  }
};

  return (
    <>
      <div
        ref={cardRef}
        className={`worker-card ${hasAlert ? "alert-outline" : ""}`}
        onClick={handleCardClick}
        style={{ cursor: "pointer" }}
      >
        <div className="worker-header">
          <h3>
            {worker.name} {worker.id}
          </h3>
          <p
            className="worker-location"
            onClick={(e) => {
              e.stopPropagation();
              setHighlightedId(worker.helmetId);
            }}
          >
            📍 Location
          </p>
        </div>

        {sensorData ? (
          <div className="sensor-icons">
            <div
              className={`sensor-item ${
                sensorData.bpmStatus === "high" ? "alert" : ""
              }`}
            >
              <img src="/icons/heart.png" alt="Heart" />
              <span>{sensorData.bpm} bpm</span>
            </div>
            <div
              className={`sensor-item ${
                sensorData.gasStatus === "danger" ? "alert" : ""
              }`}
            >
              <img src="/icons/gas.png" alt="Gas" />
              <span>{sensorData.gas} ppm</span>
            </div>
            <div
              className={`sensor-item ${
                sensorData.impactStatus === "warning" ? "alert" : ""
              }`}
            >
              <img src="/icons/impact.jpg" alt="Impact" />
              <span>
                {sensorData.imp === "no" ? `Safe` : `${sensorData.imp}`}
              </span>
            </div>
            <div
              className={`sensor-item ${
                sensorData.fallStatus === "detected" ? "alert" : ""
              }`}
            >
              <img src="/icons/fall.png" alt="Fall" />
              <span>{sensorData.fall ? `Fall detected` : `Safe`}</span>
            </div>
            <div
              className={`sensor-item ${
                sensorData.tempStatus === "danger" ? "alert" : ""
              }`}
            >
              <img src="/icons/temp.png" alt="Temperature" />
              <span>{sensorData.temp} °C</span>
            </div>
            <button
              className="sos-button"
              onClick={(e) => {
                e.stopPropagation();
                handleSOS();
              }}
            >
              🚨 Send SOS
            </button>
          </div>
        ) : (
          <p className="loading">⏳ Awaiting data…</p>
        )}
      </div>

      {showOverlay && (
        <div className="overlay-container">
          <div className="overlay-box">
            <button className="close-button" onClick={closeOverlay}>
              ✖
            </button>
            <h2>{worker.name}</h2>
            <p>
              <strong>NIC:</strong> {worker.nic}
            </p>
            <p>
              <strong>Impact:</strong> {sensorData?.imp}
            </p>
            <p>
              <strong>Gas:</strong> {sensorData?.gas} ppm
            </p>
            <p>
              <strong>Humidity:</strong> {sensorData?.hum} %
            </p>
            <p>
              <strong>Temperature:</strong> {sensorData?.temp} °C
            </p>
          </div>
        </div>
      )}

      {showSOSModal && (
        <SOSModal
          onClose={() => setShowSOSModal(false)}
          onSelect={handleSOSModeSelect}
        />
      )}
    </>
  );
}
