import { useState } from "react";
//await axios.post("/api/workers", { name, nic, contact, address });

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
      const res = await fetch("http://localhost:8000/api/workers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert("✅ Worker registered!");
        onSuccess(); // Notify parent to close the form
      } else {
        alert("❌ Error registering worker");
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
      /><br />
      <input
        type="text"
        name="nic"
        placeholder="NIC Number"
        value={formData.nic}
        onChange={handleChange}
        required
      /><br />
      <input
        type="text"
        name="contact"
        placeholder="Contact Number"
        value={formData.contact}
        onChange={handleChange}
        required
      /><br />
      <input
        type="text"
        name="address"
        placeholder="Address"
        value={formData.address}
        onChange={handleChange}
        required
      /><br />
      <button type="submit" style={{ marginTop: "10px" }}>✅ Submit</button>
    </form>
  );
};

export default RegisterWorkerForm;
