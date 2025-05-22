import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';  
import './RegisterWorkerForm.css';


const RegisterWorkerForm = ({ onClose, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    nic: '',
    contact: '',
    address: '',
    email: '',
    birth: '',
  });

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/workers/register', formData);
      onRegisterSuccess(res.data); 
      setFormData({ name: '', nic: '', contact: '', address: '', email: '', birth: '' });
      toast.success("Worker registered successfully!"); // Success toast
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to register worker'); // Error toast
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Register Worker</h3>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required />
          <input name="nic" placeholder="NIC" value={formData.nic} onChange={handleInputChange} required />
          <input name="contact" placeholder="Contact" value={formData.contact} onChange={handleInputChange} required />
          <input name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} required />
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
          <input name="birth" type="date" value={formData.birth} onChange={handleInputChange} required />
          <button type="submit">Submit</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
  
};

RegisterWorkerForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onRegisterSuccess: PropTypes.func.isRequired,
};

export default RegisterWorkerForm;
