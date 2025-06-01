import { useState, useRef } from "react";
import "./WorkerCard.css";

export default function WorkerCard({ worker, sensorData, onClick }) {
  const [showOverlay, setShowOverlay] = useState(false);
  const cardRef = useRef(null);

  const handleCardClick = () => {
    setShowOverlay(true);
    onClick?.();
  };

  const closeOverlay = () => setShowOverlay(false);

  const hasAlert =
    sensorData &&
    (sensorData.bpm > 120 ||
      sensorData.gas > 300 ||
      sensorData.imp === "impact" ||
      sensorData.temp > 37);

  return (
    <>
      <div
        ref={cardRef}
        className={`worker-card ${hasAlert ? "alert-outline" : ""}`}
        onClick={handleCardClick}
        style={{ cursor: "pointer" }}
      >
        <div className="worker-header">
          <h3>{worker.name} {worker.id}</h3>
          <p className="worker-location">📍 Location</p>
        </div>

        {sensorData ? (
          <div className="sensor-icons">
            <div className={`sensor-item ${sensorData.bpm > 120 ? "alert" : ""}`}>
              <img src="/icons/heart.png" alt="Heart" />
              <span>{sensorData.bpm} bpm</span>
            </div>
            <div className={`sensor-item ${sensorData.gas > 300 ? "alert" : ""}`}>
              <img src="/icons/gas.png" alt="Gas" />
              <span>{sensorData.gas > 300 ? "Alert" : "Safe"}</span>
            </div>
            <div className={`sensor-item ${sensorData.imp === "impact" ? "alert" : ""}`}>
              <img src="/icons/impact.jpg" alt="Impact" />
              <span>{sensorData.imp === "impact" ? "Alert" : "Safe"}</span>
            </div>
            <div className={`sensor-item ${sensorData.temp > 37 ? "alert" : ""}`}>
              <img src="/icons/temp.png" alt="Temperature" />
              <span>{sensorData.temp} °C</span>
            </div>
          </div>
        ) : (
          <p className="loading">⏳ Awaiting data…</p>
        )}
      </div>

      {showOverlay && (
        <div className="overlay-container">
          <div className="overlay-box">
            <button className="close-button" onClick={closeOverlay}>✖</button>
            <h2>{worker.name}</h2>
            <p><strong>NIC:</strong> {worker.nic}</p>
            <p><strong>Impact:</strong> {sensorData?.imp}</p>
            <p><strong>Gas:</strong> {sensorData?.gas} ppm</p>
          </div>
        </div>
      )}
    </>
  );
}
