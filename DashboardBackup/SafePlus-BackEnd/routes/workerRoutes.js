const express = require('express');
const router = express.Router();
const { registerWorker, deleteWorker, getAllWorkers , assignHelmet, getWorkersWithHelmets,loginWorker,changePassword} = require('../controllers/workerController');


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
