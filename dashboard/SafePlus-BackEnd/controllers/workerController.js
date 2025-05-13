const Worker = require('../models/worker');

// Register a new worker
const registerWorker = async (req, res) => {
  try {
    const { name, nic, contact, address, email, birth } = req.body;

    // Validations
    if (!name || !nic || !contact || !address || !email || !birth) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await Worker.findOne({ nic });
    if (existing) {
      return res.status(400).json({ error: 'Worker with this NIC already exists' });
    }

    const newWorker = await Worker.create({
      name,
      nic,
      contact,
      address,
      email,
      birth,
      registeredDate: new Date().toISOString().split('T')[0],
    });

    res.status(201).json(newWorker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Delete worker by NIC
const deleteWorker = async (req, res) => {
  try {
    const { nic } = req.params;

    const deletedWorker = await Worker.findOneAndDelete({ nic });
    if (!deletedWorker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    res.json({ message: 'Worker deleted successfully', worker: deletedWorker });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// (Optional) Get all workers
const getAllWorkers = async (req, res) => {
  try {
    const workers = await Worker.find();
    res.json(workers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

module.exports = {
  registerWorker,
  deleteWorker,
  getAllWorkers,
};
