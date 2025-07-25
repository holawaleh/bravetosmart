const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");
const Student = require("../models/Student");

// Create new subject
router.post("/create", async (req, res) => {
  try {
    const { name, code } = req.body;
    const existing = await Subject.findOne({ $or: [{ name }, { code }] });
    if (existing) return res.status(400).json({ message: "Subject already exists" });

    const subject = new Subject({ name, code });
    await subject.save();
    res.status(201).json({ message: "Subject created", subject });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Allocate subject(s) to a student
router.post("/assign", async (req, res) => {
  try {
    const { studentId, subjectIds } = req.body; // subjectIds: array of subject _id

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.subjects = [...new Set([...student.subjects, ...subjectIds])]; // avoid duplicates
    await student.save();

    res.json({ message: "Subjects assigned", student });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// View subjects for a student
router.get("/student/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("subjects");
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json({ subjects: student.subjects });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
