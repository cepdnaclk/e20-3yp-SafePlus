const express = require('express');
const router = express.Router();
const cors = require('cors');
const { registerWorker, deleteWorker, getAllWorkers , assignHelmet,} = require('../controllers/workerController');

// CORS middleware
router.use(
  cors({
    credentials: true,
    origin: 'http://localhost:5173',
  })
);

// Routes
router.post('/register', registerWorker);
router.delete('/:workerId', deleteWorker);
router.put('/assignHelmet/:nic', assignHelmet);
router.get('/', getAllWorkers); 

module.exports = router;
