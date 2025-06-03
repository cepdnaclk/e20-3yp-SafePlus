const express = require('express');
const router = express.Router();
const cors = require('cors');
const { registerWorker, deleteWorker, getAllWorkers , assignHelmet, getWorkersWithHelmets,loginWorker,changePassword} = require('../controllers/workerController');

// CORS middleware
router.use(
  cors({
    origin: true, // Allows any origin temporarily
    credentials: true,// or your mobile app's origin if needed

  })
);

// Routes
router.post('/register', registerWorker);
router.delete('/:workerId', deleteWorker);
router.put('/assignHelmet/:nic', assignHelmet);
router.get('/', getAllWorkers); 
router.get('/assigned', getWorkersWithHelmets);

// Routes for mobile app
router.post('/login', loginWorker);
router.post('/change-password', changePassword);


module.exports = router;
