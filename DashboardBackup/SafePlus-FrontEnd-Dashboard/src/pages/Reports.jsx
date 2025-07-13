import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header/Header";
import "../styles/WorkerDetails.css";
import "../styles/Reports.css";

const API_URL = import.meta.env.VITE_API_URL;

function Reports() {
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [timeRange, setTimeRange] = useState("7");
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/workers/assigned`)
      .then((res) => setWorkers(res.data))
      .catch((err) => console.error("Failed to fetch workers", err));
  }, []);

  const fetchAlerts = async () => {
    if (!selectedWorker) return;

    const days = parseInt(timeRange);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    try {
      const res = await axios.get(`${API_URL}/api/alerts`, {
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
              setAlerts([]); // clear old alerts
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

        {/* Worker Details Box */}
        {selectedWorker && (
          <div className="account-box" style={{ marginTop: "1rem" }}>
            <h3>{selectedWorker.name}</h3>
            <p><strong>NIC:</strong> {selectedWorker.nic}</p>
            <p><strong>Helmet ID:</strong> {selectedWorker.helmetId}</p>
            <p><strong>Email:</strong> {selectedWorker.email}</p>
            <p><strong>Contact:</strong> {selectedWorker.contact}</p>
            <p><strong>Address:</strong> {selectedWorker.address}</p>
            <p><strong>Worker Since:</strong> {selectedWorker.registeredDate}</p>
          </div>
        )}

        {/* Alerts Table */}
        {alerts.length > 0 ? (
          <>
            <div className="table-wrapper" style={{ marginTop: "1rem" }}>
              <table className="worker-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Alert Type</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert, idx) => (
                    <tr key={idx}>
                      <td>{new Date(alert.alertTime).toLocaleString()}</td>
                      <td>{alert.alertType.charAt(0).toUpperCase() + alert.alertType.slice(1)}</td>
                      <td>{alert.alertValue?.toString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary + Print */}
            <div style={{ marginTop: "1rem" }}>
              <p><strong>Total Alerts:</strong> {alerts.length}</p>

              <button className="action-btn" onClick={() => window.print()}>🖨️ Print Report</button>
            </div>
          </>
        ) : (
          selectedWorker && <p style={{ marginTop: "1rem" }}>No alerts found for the selected period.</p>
        )}
      </div>
    </div>
  );
}

export default Reports;
