import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header/Header";
import "../styles/Reports.css";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL;

function Reports() {
  const [mode, setMode] = useState("worker"); 

  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [timeRange, setTimeRange] = useState("7");

  const [alerts, setAlerts] = useState([]);
  const [globalAlerts, setGlobalAlerts] = useState([]);

  // Fetch assigned workers once
  useEffect(() => {
    axios.get(`${API_URL}/api/workers/assigned`)
      .then((res) => setWorkers(res.data))
      .catch((err) => console.error("Failed to fetch workers", err));
  }, []);

  // Fetch alerts for selected worker
  const fetchWorkerAlerts = async () => {
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
      setAlerts(res.data.sort((a, b) => new Date(b.alertTime) - new Date(a.alertTime)));
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    }
  };

  // Fetch all alerts (global)
  const fetchGlobalAlerts = async () => {
    const days = parseInt(timeRange);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    try {
      const res = await axios.get(`${API_URL}/api/alerts`, {
        params: { from: fromDate.toISOString() },
      });
      setGlobalAlerts(res.data);
    } catch (err) {
      console.error("Failed to fetch global alerts:", err);
    }
  };

  // Automatically fetch when mode or timeRange changes
  useEffect(() => {
    if (mode === "global") {
      fetchGlobalAlerts();
    }
  }, [mode, timeRange]);

  const getAlertTypeStats = () => {
  const types = ["gas", "bpm", "temp", "impact"];
  const stats = types.map((type) => {
    return {
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: globalAlerts.filter((a) => a.alertType === type).length,
    };
  });
  return stats;
};

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f"];

  return (
    <div>
      <Header />
      <div className="alert-details-container">
        <h2 className="account-heading">Reports</h2>

        {/* Mode Switch */}
        <div className="alert-button-container">
          <button
            className={`action-btn ${mode === "worker" ? "active" : ""}`}
            onClick={() => setMode("worker")}
          >
            Worker Reports
          </button>
          <button
            className={`action-btn ${mode === "global" ? "active" : ""}`}
            onClick={() => setMode("global")}
          >
            Global Analytics
          </button>

          <select
            className="action-btn"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7">Past Week</option>
            <option value="14">Past 2 Weeks</option>
            <option value="30">Past Month</option>
          </select>
        </div>

        {/* ============================
            MODE: WORKER REPORTS
        ============================ */}
        {mode === "worker" && (
          <>
            <div className="alert-button-container">
              <select
                className="action-btn"
                value={selectedWorker?.helmetId || ""}
                onChange={(e) => {
                  const worker = workers.find((w) => w.helmetId === e.target.value);
                  setSelectedWorker(worker);
                  setAlerts([]);
                }}
              >
                <option value="" disabled>Select Worker</option>
                {workers.map((worker) => (
                  <option key={worker.helmetId} value={worker.helmetId}>
                    {worker.name} - {worker.helmetId}
                  </option>
                ))}
              </select>

              <button className="action-btn" onClick={fetchWorkerAlerts}>
                Fetch Worker Alerts
              </button>
            </div>

            {/* Worker Info */}
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

            {/* Worker Alert Table */}
            {alerts.length > 0 ? (
              <>
                <div className="alert-table-wrapper" style={{ marginTop: "1rem" }}>
                  <table className="alert-table">
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
                          <td>
                            {alert.alertType === "temp"
                              ? `${alert.alertValue} °C`
                              : alert.alertType === "bpm"
                              ? `${alert.alertValue} bpm`
                              : alert.alertType === "gas"
                              ? `${alert.alertValue} ppm`
                              : alert.alertValue}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>



                <div style={{ marginTop: "1rem" }}>
                  <p><strong>Total Alerts:</strong> {alerts.length}</p>
                  <button className="action-btn" onClick={() => window.print()}>
                    🖨️ Print Worker Report
                  </button>
                </div>
              </>
            ) : (
              selectedWorker && <p style={{ marginTop: "1rem" }}>No alerts found for the selected period.</p>
            )}
          </>
        )}

        {/* ============================
            MODE: GLOBAL ANALYTICS
        ============================ */}
        {mode === "global" && (
          <>
            <div className="account-box" style={{ marginTop: "1rem", background: "#eef" }}>
              <h3>Global Alert Summary</h3>
              <p><strong>Time Range:</strong> Past {timeRange} Days</p>
              <p><strong>Total Alerts:</strong> {globalAlerts.length}</p>

              <ul>
                {["gas", "bpm", "temp", "impact"].map((type) => {
                  const count = globalAlerts.filter((a) => a.alertType === type).length;
                  return (
                    <li key={type}>
                      <strong>{type.charAt(0).toUpperCase() + type.slice(1)}:</strong> {count}
                    </li>
                  );
                })}
              </ul>
              {globalAlerts.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", marginTop: "2rem" }}>
                  
                  {/* Bar Chart */}
                  <div style={{ flex: 1, minWidth: "300px", height: 300 }}>
                    <h4 style={{ textAlign: "center" }}>Alert Type Counts</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getAlertTypeStats()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie Chart */}
                  <div style={{ flex: 1, minWidth: "300px", height: 300 }}>
                    <h4 style={{ textAlign: "center" }}>Alert Type Distribution</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getAlertTypeStats()}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                        >
                          {getAlertTypeStats().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>


                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}


              <div style={{ marginTop: "2rem" }}>
                <button className="action-btn" onClick={() => window.print()}>
                  🖨️ Print Global Report
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Reports;