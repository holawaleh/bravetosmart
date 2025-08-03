const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Log = require("../models/Log"); // ⬅️ Import Log model

let lastUID = ""; // store the most recent UID scanned by the device

// 1️⃣ IoT device sends UID after scan
router.post("/capture-uid", async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ message: "UID is required" });
  }

  lastUID = uid;
  console.log("UID captured from device:", uid);

  await Log.create({
    action: "UID Capture",
    details: `UID ${uid} was captured from RFID device.`,
  });

  res.status(200).json({ message: "UID captured successfully", uid });
});

// 2️⃣ Frontend fetches last scanned UID
router.get("/get-latest-uid", async (req, res) => {
  if (!lastUID) {
    return res.status(404).json({ message: "No UID scanned yet" });
  }

  await Log.create({
    action: "UID Fetch",
    details: `Frontend requested latest scanned UID: ${lastUID}`,
  });

  res.json({ uid: lastUID });
});

// 3️⃣ Register a new student (UID comes from device, not typed)
router.post("/register", async (req, res) => {
  try {
    const { name, matricNo, email, level, phone, department } = req.body;
    const uid = lastUID;

    if (!uid) {
      await Log.create({
        action: "Registration Denied",
        details: `Attempted registration denied: No UID scanned`,
      });
      return res.status(400).json({ message: "No UID scanned. Please scan RFID first." });
    }

    const exists = await Student.findOne({
      $or: [{ matricNo }, { email }, { uid }]
    });

    if (exists) {
      await Log.create({
        action: "Registration Denied",
        details: `Registration failed: UID ${uid}, MatricNo ${matricNo}, or Email ${email} already exists.`,
      });
      return res.status(400).json({ message: "Student already exists with same UID, matricNo, or email" });
    }

    const newStudent = new Student({
      name,
      matricNo,
      email,
      level,
      phone,
      department,
      uid
    });

    await newStudent.save();

    await Log.create({
      user: newStudent._id,
      action: "Student Registered",
      details: `New student registered: ${name} (${matricNo})`,
    });

    lastUID = ""; // clear after successful registration

    res.status(201).json({ message: "Student registered successfully", student: newStudent });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔍 Optional: Get student by UID
router.get("/uid/:uid", async (req, res) => {
  try {
    const student = await Student.findOne({ uid: req.params.uid });
    if (!student) {
      await Log.create({
        action: "UID Lookup Failed",
        details: `No student found with UID ${req.params.uid}`,
      });
      return res.status(404).json({ message: "Student not found" });
    }

    await Log.create({
      user: student._id,
      action: "UID Lookup Success",
      details: `Student with UID ${req.params.uid} found: ${student.name}`,
    });

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    await Log.create({
      action: "Fetch Students",
      details: `Fetched all students (${students.length})`,
    });

    res.json(students);
  } catch (err) {
    console.error("❌ Error in GET /api/students:", err.message, err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.get("/test", (req, res) => {
  res.json({ message: "Test route working!" });
});

module.exports = router;
