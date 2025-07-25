const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");
const Student = require("../models/Student");

// Create a new subject
router.post("/", async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: "Name and code are required" });
    }

    const existing = await Subject.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: "Subject already exists with this code" });
    }

    const subject = new Subject({ name, code });
    await subject.save();

    res.status(201).json(subject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all subjects
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: -1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Assign subjects to a student
router.post("/assign", async (req, res) => {
  try {
    const { studentId, subjectIds } = req.body;

    if (!studentId || !Array.isArray(subjectIds)) {
      return res.status(400).json({ message: "studentId and subjectIds[] are required" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Avoid duplicate subjects
    const uniqueSubjects = [...new Set([...student.subjects.map(id => id.toString()), ...subjectIds])];
    student.subjects = uniqueSubjects;

    await student.save();

    res.json({ message: "Subjects assigned successfully", student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get student with populated subjects
router.get("/student/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("subjects");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
