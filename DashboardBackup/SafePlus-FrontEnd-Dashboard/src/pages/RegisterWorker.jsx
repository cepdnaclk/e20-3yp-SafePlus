import { useState } from "react";
import PropTypes from "prop-types";

const API_URL = import.meta.env.VITE_API_URL;

const RegisterWorkerForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    nic: "",
    contact: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/workers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert("✅ Worker registered!");
        if (onSuccess) onSuccess();
      } else {
        const errorData = await res.json();
        alert("❌ Error registering worker: " + (errorData.message || "Unknown error"));
      }
    } catch (error) {
      console.error("❌ Server error:", error);
      alert("❌ Server error");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange}
        required
        aria-label="Full Name"
      /><br />
      <input
        type="text"
        name="nic"
        placeholder="NIC Number"
        value={formData.nic}
        onChange={handleChange}
        required
        aria-label="NIC Number"
      /><br />
      <input
        type="text"
        name="contact"
        placeholder="Contact Number"
        value={formData.contact}
        onChange={handleChange}
        required
        aria-label="Contact Number"
      /><br />
      <input
        type="text"
        name="address"
        placeholder="Address"
        value={formData.address}
        onChange={handleChange}
        required
        aria-label="Address"
      /><br />
      <button type="submit" style={{ marginTop: "10px" }}>✅ Submit</button>
    </form>
  );
};

RegisterWorkerForm.propTypes = {
  onSuccess: PropTypes.func
};

export default RegisterWorkerForm;
