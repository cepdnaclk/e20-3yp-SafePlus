import { useState, useEffect } from 'react';
import axios from 'axios';
import './AssignHelmetForm.css';
import PropTypes from 'prop-types';

const AssignHelmetForm = ({ onClose, onAssignSuccess }) => {
  const [workers, setWorkers] = useState([]);
  const [selectedNIC, setSelectedNIC] = useState('');
  const [helmetID, setHelmetID] = useState('');

  useEffect(() => {
    axios.get('/api/workers')
      .then(res => setWorkers(res.data))
      .catch(err => console.error('Error fetching workers:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/workers/assignHelmet/${selectedNIC}`, { helmetID });
      onAssignSuccess();
      onClose();
    } catch (err) {
      console.error('Error assigning helmet:', err);
      alert('Failed to assign helmet');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="form-container">
        <h3>Assign Helmet ID</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Select Worker:
            <select value={selectedNIC} onChange={(e) => setSelectedNIC(e.target.value)} required>
              <option value="">--Select--</option>
              {workers.map(worker => (
                <option key={worker.nic} value={worker.nic}>
                  {worker.name} ({worker.nic})
                </option>
              ))}
            </select>
          </label>

          <label>
            Helmet ID:
            <input
              type="text"
              value={helmetID}
              onChange={(e) => setHelmetID(e.target.value)}
              required
            />
          </label>

          <div className="button-group">
            <button type="submit">Assign</button>
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

AssignHelmetForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAssignSuccess: PropTypes.func.isRequired,
};

export default AssignHelmetForm;
