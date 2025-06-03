const Worker = require('../models/worker');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendCredentialsEmail } = require('../helpers/autoemail');

// Register a new worker
const registerWorker = async (req, res) => {
  try {
    const { name, nic, contact, address, email, birth } = req.body;
    const plainPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Validations
    if (!name || !nic || !contact || !address || !email || !birth) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await Worker.findOne({ nic });
    if (existing) {
      return res.status(400).json({ error: 'Worker with this NIC already exists' });
    }
    
    console.log(`Generated plain password for ${email}: ${plainPassword}`);
    // Hash the password
    
    const newWorker = await Worker.create({
      name,
      nic,
      contact,
      address,
      email,
      birth,
      registeredDate: new Date().toISOString().split('T')[0],
      password: hashedPassword,
      mustChangePassword: true // Set to true for first-time login
    });

    res.status(201).json(newWorker);
    await sendCredentialsEmail(email, plainPassword);
    if (!hashedPassword) {
      console.error('Error hashing password');}
    console.log(`Generated password for ${email}: ${plainPassword}`);
    console.log(`Credentials sent to ${email}: Username: ${email}, Password: ${plainPassword}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

const deleteWorker = async (req, res) => {
  try {
    const { workerId } = req.params;

    // Extract token from request (cookie or headers)
    const token = req.cookies.token || req.headers['authorization'].split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name } = decoded;

    // Validate the worker's existence
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Proceed with deletion
    const deletedWorker = await Worker.findByIdAndDelete(workerId);
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

const getWorkersWithHelmets = async (req, res) => {
  try {
    const workers = await Worker.find({ helmetId: { $exists: true, $ne: null } });
    res.json(workers);
  } catch (err) {
    console.error("Error fetching assigned workers:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// Login function for mobile app
const loginWorker = async (req, res) => {
  let { email, password } = req.body;
  email = email.trim().toLowerCase();
  console.log('Login attempt with email:', email);
  try {
    const worker = await Worker.findOne({ email });
    if (!worker) return res.status(400).json({ message: "User not found" });
    console.log('Worker found:', worker.name);
    const isMatch = await bcrypt.compare(password, worker.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
    console.log('Password match for worker:', worker.name);
    res.status(200).json({
      message: "Login successful",
      userId: worker._id,
      username: worker.name,
      email: worker.email,
      mustChangePassword: worker.mustChangePassword || false,
      helmetID : worker.helmetId || null
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Change password mobile application
const changePassword = async (req, res) => {
  const { userId, newPassword } = req.body;
  console.log('Change password request:', req.body);
  try {
    
    const worker = await Worker.findById(userId);
    if (!worker) return res.status(404).json({ message: "User not found" });
    console.log('Worker found for password change:', worker.name);

    worker.password = await bcrypt.hash(newPassword, 10);
    console.log('New password hashed for worker:', worker.name);
    worker.mustChangePassword = false; // Reset mustChangePassword flag
    await worker.save();
    
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  registerWorker,
  deleteWorker,
  getAllWorkers,
  assignHelmet,
  getWorkersWithHelmets,
  loginWorker,
  changePassword
};
