const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");
const Log = require("../models/Log");

// GET all subjects
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: -1 });

    await Log.create({
      action: "Fetch Subjects",
      details: `Fetched ${subjects.length} subjects`,
    });

    res.json(subjects);
  } catch (err) {
    console.error("❌ Error fetching subjects:", err.message, err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ POST /api/subjects/create
router.post("/create", async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: "Name and code are required" });
    }

    const existing = await Subject.findOne({ $or: [{ name }, { code }] });
    if (existing) {
      return res.status(400).json({ message: "Subject already exists" });
    }

    const subject = await Subject.create({ name, code });

    await Log.create({
      action: "Create Subject",
      details: `Created subject: ${name} (${code})`,
    });

    res.status(201).json({ message: "Subject created successfully", subject });
  } catch (err) {
    console.error("❌ Error creating subject:", err.message, err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
