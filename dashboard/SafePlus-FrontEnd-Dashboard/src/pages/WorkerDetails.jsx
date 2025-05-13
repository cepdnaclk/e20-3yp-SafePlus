import { useEffect, useState } from 'react';
import axios from 'axios';
import RegisterWorkerForm from '../components/RegisterWorker/RegisterWorkerForm';
import Header from '../components/Header/Header';
import '../styles/WorkerDetails.css';

const WorkerDetails = () => {
  const [showForm, setShowForm] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

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

  const handleDelete = async (nic) => {
    try {
      await axios.delete(`/api/workers/${nic}`);
      setWorkers(prev => prev.filter(worker => worker.nic !== nic));
    } catch (err) {
      console.error('Failed to delete worker:', err);
      alert('Failed to delete worker');
    }
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
    <><div>       <Header />
    </div>
    <div className="worker-details-container">
        <button className="register-btn" onClick={() => setShowForm(true)}>Register Worker</button>

        {showForm && (
          <RegisterWorkerForm
            onClose={() => setShowForm(false)}
            onRegisterSuccess={(newWorker) => setWorkers(prev => [...prev, newWorker])} />
        )}
        <div className="table-wrapper">
        <table className="worker-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Worker Name</th>
              <th>NIC</th>
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
                <td>{worker.contact}</td>
                <td>{worker.address}</td>
                <td>{worker.email}</td>
                <td>{worker.birth}</td>
                <td>{worker.registeredDate}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(worker.nic)}>Delete</button>
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
      </div></>
  );
};

export default WorkerDetails;
