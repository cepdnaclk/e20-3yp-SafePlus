import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import '../RegisterWorker/RegisterWorkerForm.css'; // Reuse same styles

const ConfirmDeleteForm = ({ onClose, worker, onDeleteSuccess }) => {
  const [name, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleDelete = async () => {
    try {
      const res = await axios.delete(`/api/workers/${worker._id}`, {
        data: { username: name, password },
      });
      console.log('Delete response:', res.data);
      toast.success("Worker deleted successfully!");
      onDeleteSuccess(worker._id);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete worker');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete <strong>{worker?.name}</strong>?</p>
        <form onSubmit={(e) => { e.preventDefault(); handleDelete(); }}>
          <input
            name="username"
            placeholder="Your Username"
            value={name}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Delete</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

ConfirmDeleteForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  worker: PropTypes.object.isRequired,
  onDeleteSuccess: PropTypes.func.isRequired,
};

export default ConfirmDeleteForm;
