export default function WorkerCard({ worker, sensorData }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "1rem",
        width: "280px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h3 style={{ margin: "0 0 0.5rem 0", color: "#007bff" }}>
        👷 {worker.name}
      </h3>
      <p style={{ margin: 0 }}>
        <strong>NIC:</strong> {worker.nic}
      </p>
      <p style={{ margin: 0 }}>
        <strong>Helmet ID:</strong> {worker.helmetId}
      </p>

      <hr style={{ margin: "1rem 0" }} />

      {sensorData ? (
        <div>
          <p>🌡️ Temp: {sensorData.tmp} °C</p>
          <p>💧 Humidity: {sensorData.hum} %</p>
          <p>❤️ BPM: {sensorData.bpm}</p>
          <p>📊 Acc: {sensorData.acc} g</p>
          <p>🌀 Gyro: {sensorData.gyr} °/s</p>
          <p>☢️ Gas: {sensorData.gas} ppm</p>

          {/* Impact */}
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              borderRadius: "6px",
              backgroundColor:
                sensorData.imp === "impact" ? "#f8d7da" : "#d4edda",
              color: sensorData.imp === "impact" ? "#721c24" : "#155724",
              border:
                sensorData.imp === "impact"
                  ? "1px solid #f5c6cb"
                  : "1px solid #c3e6cb",
            }}
          >
            <strong>
              {sensorData.imp === "impact"
                ? "🚨 Impact Detected"
                : "✅ No Impact"}
            </strong>
          </div>

          {/* Gas Alert */}
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              borderRadius: "6px",
              backgroundColor:
                sensorData.gas > 900 ? "#f8d7da" : "#d4edda",
              color: sensorData.gas > 900 ? "#721c24" : "#155724",
              border:
                sensorData.gas > 900
                  ? "1px solid #f5c6cb"
                  : "1px solid #c3e6cb",
            }}
          >
            <strong>
              {sensorData.gas > 900
                ? "☠️ High Gas Level"
                : "✅ Gas Levels Normal"}
            </strong>
          </div>

          {/* SOS Alert */}
          {sensorData.btn && (
            <div
              style={{
                marginTop: "10px",
                padding: "10px",
                borderRadius: "6px",
                backgroundColor: "#f8d7da",
                color: "#721c24",
                border: "1px solid #f5c6cb",
              }}
            >
              <strong>🚨 SOS Alert!</strong>
            </div>
          )}
        </div>
      ) : (
        <p style={{ color: "#888" }}>⏳ Awaiting data…</p>
      )}
    </div>
  );
}
