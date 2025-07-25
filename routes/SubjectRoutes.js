const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");
const Student = require("../models/Student");

// ✅ Create a new subject
router.post("/create", async (req, res) => {
  try {
    const { name, code } = req.body;

    const subject = new Subject({ name, code });
    await subject.save();

    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: "Failed to create subject", error: err.message });
  }
});

// ✅ Get all subjects
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subjects", error: err.message });
  }
});

// ✅ Assign subject(s) to a student
router.post("/assign", async (req, res) => {
  try {
    const { studentId, subjectIds } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Prevent duplicate subjects
    const uniqueSubjects = [...new Set([
      ...student.subjects.map(id => id.toString()),
      ...subjectIds
    ])];

    student.subjects = uniqueSubjects;
    await student.save();

    res.json({ message: "Subjects assigned successfully", student });
  } catch (err) {
    res.status(500).json({ message: "Assignment failed", error: err.message });
  }
});

// ✅ Remove a subject from a student
router.post("/unassign", async (req, res) => {
  try {
    const { studentId, subjectId } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.subjects = student.subjects.filter(id => id.toString() !== subjectId);
    await student.save();

    res.json({ message: "Subject removed from student", student });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove subject", error: err.message });
  }
});

// ✅ Get subjects assigned to a student (with subject details)
router.get("/student/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("subjects");
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json({ subjects: student.subjects });
  } catch (err) {
    res.status(500).json({ message: "Failed to get student's subjects", error: err.message });
  }
});

module.exports = router;
