const express = require('express');
const router = express.Router();
const cors = require('cors');
const { registerWorker, deleteWorker, getAllWorkers , assignHelmet,getWorkersWithHelmets,loginWorker,changePassword} = require('../controllers/workerController');

// CORS middleware
router.use(
  cors({
    credentials: true,
    origin: ['http://localhost:5173',
        'http://10.40.19.169:8000', ],// or your mobile app's origin if needed

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
