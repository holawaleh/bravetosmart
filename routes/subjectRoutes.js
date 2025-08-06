const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");
const Log = require("../models/Log");

// ✅ GET all subjects
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

// ✅ POST /api/subjects/create - Add a new subject
router.post("/create", async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: "Name and code are required" });
    }

    const existing = await Subject.findOne({ code });
    if (existing) {
      return res.status(409).json({ message: "Subject code already exists" });
    }

    const subject = await Subject.create({ name, code });

    await Log.create({
      action: "Create Subject",
      details: `Created subject with name: ${name}, code: ${code}`,
    });

    res.status(201).json({ message: "Subject created", subject });
  } catch (err) {
    console.error("❌ Error creating subject:", err.message, err.stack);
    res.status(500).json({ message: "Error creating subject", error: err.message });
  }
});

module.exports = router;
