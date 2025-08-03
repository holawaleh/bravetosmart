const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");
const Log = require("../models/Log"); // if logging

// GET all subjects
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: -1 });

    await Log.create({
      action: "Fetch Subjects", // make sure this is valid in your Log enum
      details: `Fetched ${subjects.length} subjects`,
    });

    res.json(subjects);
  } catch (err) {
    console.error("❌ Error fetching subjects:", err.message, err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
