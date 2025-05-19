import "./WorkerCard.css"; // Make sure to import the CSS

export default function WorkerCard({ worker, sensorData }) {
  return (
    <div className="worker-card">
      <h3 className="worker-name">👷 {worker.name}</h3>
      <p><strong>NIC:</strong> {worker.nic}</p>
      <p><strong>Helmet ID:</strong> {worker.helmetId}</p>

      <hr />

      {sensorData ? (
        <div className="sensor-section">
          <p>🌡️ Temp: {sensorData.tmp} °C</p>
          <p>💧 Humidity: {sensorData.hum} %</p>
          <p>❤️ BPM: {sensorData.bpm}</p>
          <p>📊 Acc: {sensorData.acc} g</p>
          <p>🌀 Gyro: {sensorData.gyr} °/s</p>
          <p>☢️ Gas: {sensorData.gas} ppm</p>

          <div className={`alert ${sensorData.imp === "impact" ? "alert-danger" : "alert-success"}`}>
            <strong>
              {sensorData.imp === "impact" ? "🚨 Impact Detected" : "✅ No Impact"}
            </strong>
          </div>

          <div className={`alert ${sensorData.gas > 900 ? "alert-danger" : "alert-success"}`}>
            <strong>
              {sensorData.gas > 900 ? "☠️ High Gas Level" : "✅ Gas Levels Normal"}
            </strong>
          </div>

          {sensorData.btn && (
            <div className="alert alert-danger">
              <strong>🚨 SOS Alert!</strong>
            </div>
          )}
        </div>
      ) : (
        <p className="loading">⏳ Awaiting data…</p>
      )}
    </div>
  );
}
