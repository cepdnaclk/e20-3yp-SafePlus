import { useState, useEffect } from 'react';
import axios from 'axios';
import RegisterWorkerForm from '../components/RegisterWorker/RegisterWorkerForm';
import Header from '../components/Header/Header';
import '../styles/WorkerDetails.css';
import AssignHelmetForm from '../components/AssignHelmet/AssignHelmetForm';
import ConfirmDeleteForm from '../components/ConfirmDelete/ConfirmDeleteForm';
import { toast } from 'react-hot-toast'; 
const { sendNotification } = useNotifications();

sendNotification({ id, message, onClick });

const WorkerDetails = () => {
  const [workers, setWorkers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showHelmetForm, setShowHelmetForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deleteWorker, setDeleteWorker] = useState(null); // Store the worker to be deleted

  const fetchWorkers = async () => {
    try {
      const res = await axios.get('/api/workers');
      setWorkers(res.data);
    } catch (err) {
      console.error('Failed to fetch workers:', err);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const totalPages = Math.ceil(workers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWorkers = workers.slice(indexOfFirstItem, indexOfLastItem);

  const handleDelete = (worker) => {
    setDeleteWorker(worker);  // Set the worker to be deleted
    setShowDeleteForm(true);  // Show the delete confirmation modal
  };

  const handleDeleteSuccess = (deletedWorkerId) => {
    setWorkers(prev => prev.filter(worker => worker._id !== deletedWorkerId));
    toast.success("Worker deleted successfully!");
  };

  const handleAssignSuccess = () => {
    fetchWorkers();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to page 1
  };

  return (
    <div>
      <Header />
      <div className="worker-details-container">
        <div className="button-container">
          <button className="action-btn" onClick={() => setShowForm(true)}>Register Worker</button>
          <button className="action-btn" onClick={() => setShowHelmetForm(true)}>Assign Helmet</button>
        </div>

        {showForm && (
          <RegisterWorkerForm
            onClose={() => setShowForm(false)}
            onRegisterSuccess={(newWorker) => setWorkers(prev => [...prev, newWorker])} />
        )}

        {showHelmetForm && (
          <AssignHelmetForm
            onClose={() => setShowHelmetForm(false)}
            onAssignSuccess={handleAssignSuccess}
          />
        )}

        {showDeleteForm && (
          <ConfirmDeleteForm
            onClose={() => setShowDeleteForm(false)}
            worker={deleteWorker} 
            onDeleteSuccess={handleDeleteSuccess}  // Pass the success handler here
          />
        )}

        <div className="table-wrapper">
          <table className="worker-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Worker Name</th>
                <th>NIC</th>
                <th>Helmet ID</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Email</th>
                <th>Date of Birth</th>
                <th>Worker Since</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentWorkers.map((worker, idx) => (
                <tr key={worker.nic}>
                  <td>{indexOfFirstItem + idx + 1}</td>
                  <td>{worker.name}</td>
                  <td>{worker.nic}</td>
                  <td>{worker.helmetId ? worker.helmetId : "Not Assigned"}</td>
                  <td>{worker.contact}</td>
                  <td>{worker.address}</td>
                  <td>{worker.email}</td>
                  <td>{worker.birth}</td>
                  <td>{worker.registeredDate}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(worker)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="pagination-controls">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
          <span className="page-number">{currentPage}</span>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</button>
          <span> of {totalPages} pages</span>

          <div className="items-per-page">
            Showing
            <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
              {[5, 10, 15, 20, 25].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            items per page
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDetails;
