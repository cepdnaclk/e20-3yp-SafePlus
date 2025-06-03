import { useState, useRef, useEffect } from "react";
import { useHighlight } from "../../context/HighlightContext";
import { useNotifications } from "../../context/NotificationContext";
import "./WorkerCard.css";

export default function WorkerCard({ worker, sensorData, onClick }) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [acknowledgedAlertKey, setAcknowledgedAlertKey] = useState(null);

  const cardRef = useRef(null);
  const { setHighlightedId } = useHighlight();
  const { sendNotification } = useNotifications();

  const alertTypes = ["CO", "lpg", "smoke"];

  const hasAlert =
    sensorData &&
    (sensorData.bpm > 120 ||
      alertTypes.includes(sensorData.typ) ||
      sensorData.imp === "impact" ||
      sensorData.temp > 37 ||
      sensorData.btn);

  const currentAlertKey = hasAlert ? `${worker.id}-${sensorData?.bpm}-${sensorData?.typ}-${sensorData?.imp}-${sensorData?.temp}` : null;

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
          }
        });
      }

      //const timeout = setTimeout(() => {
      //  setShowAlert(false);
      //}, 10000);

      //return () => clearTimeout(timeout);
    }
  }, [hasAlert, currentAlertKey, acknowledgedAlertKey, sendNotification, worker.id, worker.name]);

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
            <div className={`sensor-item ${sensorData.bpm > 120 ? "alert" : ""}`}>
              <img src="/icons/heart.png" alt="Heart" />
              <span>{sensorData.bpm} bpm</span>
            </div>
            <div className={`sensor-item ${alertTypes.includes(sensorData.typ) ? "alert" : ""}`}>
              <img src="/icons/gas.png" alt="Gas" />
              <span>
                {sensorData.typ === "safe" || sensorData.typ === "warming"
                  ? `${sensorData.gas} ppm - Safe`
                  : `${sensorData.gas} ppm - ${sensorData.typ}`}
              </span>
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
            <p><strong>Humidity:</strong> {sensorData?.hum} %</p>
            <p><strong>Temperature:</strong> {sensorData?.temp} °C</p>
          </div>
        </div>
      )}
    </>
  );
}
