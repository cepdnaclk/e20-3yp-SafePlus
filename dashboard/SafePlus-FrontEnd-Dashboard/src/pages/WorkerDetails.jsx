import { useState } from "react";
import Header from "../components/Header/Header";
import RegisterWorkerForm from "../pages/RegisterWorker";

function WorkerDetails() {
  const [showForm, setShowForm] = useState(false);

  const handleFormSuccess = () => {
    setShowForm(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Header />

      <h2>👷 Worker Details</h2>

      <button onClick={() => setShowForm(!showForm)} style={{ marginTop: "10px" }}>
        ➕ Register New Worker
      </button>

      {showForm && <RegisterWorkerForm onSuccess={handleFormSuccess} />}
    </div>
  );
}

export default WorkerDetails;
