import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header/Header";
import "../styles/WorkerDetails.css";

const API_URL = import.meta.env.VITE_API_URL;

function Reports() {
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [timeRange, setTimeRange] = useState("7"); // Default 1 week
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/workers/assigned`).then((res) => setWorkers(res.data));
  }, []);

  const fetchAlerts = async () => {
    if (!selectedWorker) return;

    const days = parseInt(timeRange);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    try {
      const res = await axios.get(`${API_URL}/api/sensor/alerts`, {
        params: {
          helmetId: selectedWorker.helmetId,
          from: fromDate.toISOString(),
        },
      });
      setAlerts(res.data);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    }
  };

  return (
    <div>
      <Header />
      <div className="worker-details-container">
        <h2 className="account-heading">Reports</h2>

        <div className="button-container">
          <select
            className="action-btn"
            value={selectedWorker?.helmetId || ""}
            onChange={(e) => {
              const worker = workers.find((w) => w.helmetId === e.target.value);
              setSelectedWorker(worker);
            }}
          >
            <option value="">Select Worker</option>
            {workers.map((worker) => (
              <option key={worker.helmetId} value={worker.helmetId}>
                {worker.name} - {worker.helmetId}
              </option>
            ))}
          </select>

          <select
            className="action-btn"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7">Past Week</option>
            <option value="14">Past 2 Weeks</option>
            <option value="30">Past Month</option>
          </select>

          <button className="action-btn" onClick={fetchAlerts}>Fetch Reports</button>
        </div>

        {alerts.length > 0 ? (
          <div className="table-wrapper">
            <table className="worker-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>BPM</th>
                  <th>Gas</th>
                  <th>Temp</th>
                  <th>Impact</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert, idx) => (
                  <tr key={idx}>
                    <td>{new Date(alert.createdAt).toLocaleString()}</td>
                    <td>{alert.bpm}</td>
                    <td>{alert.gas}</td>
                    <td>{alert.temp} °C</td>
                    <td>{alert.imp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          selectedWorker && <p style={{ marginTop: "1rem" }}>No alerts found for the selected period.</p>
        )}
      </div>
    </div>
  );
}

export default Reports;
