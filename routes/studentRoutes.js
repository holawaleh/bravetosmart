const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

let lastUID = ""; // store the most recent UID scanned by the device

// 1️⃣ IoT device sends UID after scan
router.post("/capture-uid", (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ message: "UID is required" });
  }

  lastUID = uid; // store the UID temporarily
  console.log("UID captured from device:", uid);
  res.status(200).json({ message: "UID captured successfully", uid });
});

// 2️⃣ Frontend fetches last scanned UID
router.get("/get-latest-uid", (req, res) => {
  if (!lastUID) {
    return res.status(404).json({ message: "No UID scanned yet" });
  }

  res.json({ uid: lastUID });
});

// 3️⃣ Register a new student (UID comes from device, not typed)
router.post("/register", async (req, res) => {
  try {
    const { name, matricNo, email, level, phone, department } = req.body;
    const uid = lastUID;

    if (!uid) {
      return res.status(400).json({ message: "No UID scanned. Please scan RFID first." });
    }

    // Check if UID, matricNo, or email already exists
    const exists = await Student.findOne({
      $or: [{ matricNo }, { email }, { uid }]
    });

    if (exists) {
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

    // Reset lastUID to prevent accidental reuse
    lastUID = "";

    res.status(201).json({ message: "Student registered successfully", student: newStudent });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔍 Optional: Get student by UID (e.g. for login)
router.get("/uid/:uid", async (req, res) => {
  try {
    const student = await Student.findOne({ uid: req.params.uid });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 }); // latest first
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/test", (req, res) => {
  res.json({ message: "Test route working!" });
});


module.exports = router;
