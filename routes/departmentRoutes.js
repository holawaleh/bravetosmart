const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Log = require('../models/Log');

// Register a new department
router.post('/register', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Department name is required' });
    }
    const exists = await Department.findOne({ name: name.trim() });
    if (exists) {
      return res.status(400).json({ message: 'Department already exists' });
    }
    const department = new Department({ name: name.trim() });
    await department.save();
    await Log.create({
      action: 'Department Registered',
      details: `New department registered: ${name}`
    });
    res.status(201).json({ message: 'Department registered successfully', department });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// (Optional) Delete a department
router.delete('/:id', async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    await Log.create({
      action: 'Department Deleted',
      details: `Department deleted: ${department.name}`
    });
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
