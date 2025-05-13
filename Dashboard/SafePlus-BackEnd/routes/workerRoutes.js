const express = require('express');
const router = express.Router();
const cors = require('cors');
const { registerWorker, deleteWorker, getAllWorkers } = require('../controllers/workerController');

// CORS middleware
router.use(
  cors({
    credentials: true,
    origin: 'http://localhost:5173',
  })
);

// Routes
router.post('/register', registerWorker);
router.delete('/:nic', deleteWorker);
router.get('/', getAllWorkers); // Optional: for displaying all workers

module.exports = router;
