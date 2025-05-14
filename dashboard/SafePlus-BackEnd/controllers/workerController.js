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

// assign helmet to a worker
const assignHelmet = async (req, res) => {
  const nic = req.params.nic;
  const { helmetID } = req.body;

  try {
    const worker = await Worker.findOne({ nic });

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    worker.helmetId = helmetID; // or whatever field you're using
    await worker.save();

    res.status(200).json({ message: 'Helmet assigned successfully', worker });
  } catch (error) {
    console.error('Error assigning helmet:', error);
    res.status(500).json({ error: 'Server error' });
  }

  console.log('Updating NIC:', nic, 'with helmet ID:', helmetID);

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
  assignHelmet,
};
