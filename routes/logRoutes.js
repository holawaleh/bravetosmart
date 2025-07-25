const express = require("express");
const Log = require("../models/Log");
const Student = require("../models/Student");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// GET all logs (admin + superadmin)
router.get("/", authMiddleware, roleMiddleware(["admin", "superadmin"]), async (req, res) => {
  try {
    const logs = await Log.find().populate("student", "name matricNo department").sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve logs", error: err.message });
  }
});

// GET summary (e.g., total entries, total exits, per student)
router.get("/summary", authMiddleware, roleMiddleware(["admin", "superadmin"]), async (req, res) => {
  try {
    const total = await Log.countDocuments();
    const entryCount = await Log.countDocuments({ action: "entry" });
    const exitCount = await Log.countDocuments({ action: "exit" });

    const perStudent = await Log.aggregate([
      {
        $group: {
          _id: "$student",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalLogs: total,
      entryCount,
      exitCount,
      logsPerStudent: perStudent
    });
  } catch (err) {
    res.status(500).json({ message: "Summary fetch failed", error: err.message });
  }
});

module.exports = router;
