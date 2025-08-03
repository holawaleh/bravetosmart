const express = require("express");
const Log = require("../models/Log");
const Student = require("../models/Student");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// 🔍 GET all logs (activity + scans)
router.get("/", authMiddleware, roleMiddleware(["admin", "superadmin"]), async (req, res) => {
  try {
    const logs = await Log.find()
      .populate("user", "username role")
      .populate("student", "name matricNo department")
      .sort({ createdAt: -1 });

    // ✅ Log successful fetch
    await Log.create({
      user: req.user?.id,
      action: "log-fetch",
      status: "success",
      details: `All logs fetched by ${req.user?.role || 'unknown user'}`,
      ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress
    });

    res.json(logs);
  } catch (err) {
    await Log.create({
      user: req.user?.id,
      action: "log-fetch",
      status: "failed",
      details: err.message,
      ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress
    });

    res.status(500).json({ message: "Failed to retrieve logs", error: err.message });
  }
});

// 📊 GET summary of scan activity
router.get("/summary", authMiddleware, roleMiddleware(["admin", "superadmin"]), async (req, res) => {
  try {
    const totalLogs = await Log.countDocuments();
    const entryCount = await Log.countDocuments({ action: "entry" });
    const exitCount = await Log.countDocuments({ action: "exit" });

    const logsPerStudent = await Log.aggregate([
      { $match: { student: { $ne: null } } },
      {
        $group: {
          _id: "$student",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      {
        $project: {
          studentName: "$student.name",
          matricNo: "$student.matricNo",
          scanCount: "$count"
        }
      }
    ]);

    // ✅ Log successful summary fetch
    await Log.create({
      user: req.user?.id,
      action: "log-summary",
      status: "success",
      details: `Summary logs fetched by ${req.user?.role || 'unknown user'}`,
      ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress
    });

    res.json({
      totalLogs,
      entryCount,
      exitCount,
      logsPerStudent
    });
  } catch (err) {
    await Log.create({
      user: req.user?.id,
      action: "log-summary",
      status: "failed",
      details: err.message,
      ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress
    });

    res.status(500).json({ message: "Summary fetch failed", error: err.message });
  }
});

// 🔧 TEMPORARY: Create a log manually
router.post("/test", authMiddleware, async (req, res) => {
  try {
    const log = await Log.create({
      user: req.user?.id,
      action: "test-log",
      status: "success",
      details: "Manually created test log from /api/logs/test",
      ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress
    });

    res.status(201).json(log);
  } catch (err) {
    console.error("Log creation error:", err.message);
    res.status(500).json({ message: "Failed to create test log", error: err.message });
  }
});


module.exports = router;
