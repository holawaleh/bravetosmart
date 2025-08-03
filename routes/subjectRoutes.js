const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");
const Student = require("../models/Student");
const Log = require("../models/Log");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ✅ Create a new subject
router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const { name, code } = req.body;
      const subject = new Subject({ name, code });
      await subject.save();

      await Log.create({
        user: req.user?.id,
        action: "subject-create",
        status: "success",
        details: `New subject created: ${name} (${code})`,
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      });

      res.status(201).json(subject);
    } catch (err) {
      await Log.create({
        user: req.user?.id,
        action: "subject-create",
        status: "failed",
        details: `Error: ${err.message}`,
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      });
      res.status(500).json({ message: "Failed to create subject", error: err.message });
    }
  }
);

// ✅ Get all subjects
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const subjects = await Subject.find();

      await Log.create({
        user: req.user?.id,
        action: "subject-fetch",
        status: "success",
        details: `Fetched ${subjects.length} subject(s)`,
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      });

      res.json(subjects);
    } catch (err) {
      await Log.create({
        user: req.user?.id,
        action: "subject-fetch",
        status: "failed",
        details: `Error: ${err.message}`,
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      });

      res.status(500).json({ message: "Failed to fetch subjects", error: err.message });
    }
  }
);

// ✅ Assign subject(s) to a student
router.post(
  "/assign",
  authMiddleware,
  roleMiddleware(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const { studentId, subjectIds } = req.body;
      const student = await Student.findById(studentId);
      if (!student) {
        await Log.create({
          user: req.user?.id,
          action: "student-assign",
          status: "failed",
          details: `Student not found for ID: ${studentId}`,
          ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        });
        return res.status(404).json({ message: "Student not found" });
      }

      const uniqueSubjects = [...new Set([
        ...student.subjects.map(id => id.toString()),
        ...subjectIds
      ])];

      student.subjects = uniqueSubjects;
      await student.save();

      await Log.create({
        user: req.user?.id,
        student: student._id,
        action: "assign-subject",
        status: "success",
        details: `Assigned subjects [${subjectIds.join(", ")}] to ${student.name}`,
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      });

      res.json({ message: "Subjects assigned successfully", student });
    } catch (err) {
      await Log.create({
        user: req.user?.id,
        action: "assign-subject",
        status: "failed",
        details: `Error: ${err.message}`,
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      });

      res.status(500).json({ message: "Assignment failed", error: err.message });
    }
  }
);

// ✅ Remove a subject from a student
router.post(
  "/unassign",
  authMiddleware,
  roleMiddleware(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const { studentId, subjectId } = req.body;
      const student = await Student.findById(studentId);
      if (!student) {
        await Log.create({
          user: req.user?.id,
          action: "student-unassign",
          status: "failed",
          details: `Student not found for ID: ${studentId}`,
          ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        });
        return res.status(404).json({ message: "Student not found" });
      }

      student.subjects = student.subjects.filter(id => id.toString() !== subjectId);
      await student.save();

      await Log.create({
        user: req.user?.id,
        student: student._id,
        action: "unassign-subject",
        status: "success",
        details: `Unassigned subject ${subjectId} from ${student.name}`,
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      });

      res.json({ message: "Subject removed from student", student });
    } catch (err) {
      await Log.create({
        user: req.user?.id,
        action: "unassign-subject",
        status: "failed",
        details: `Error: ${err.message}`,
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      });

      res.status(500).json({ message: "Failed to remove subject", error: err.message });
    }
  }
);

// ✅ Get subjects assigned to a student
router.get(
  "/student/:id",
  authMiddleware,
  roleMiddleware(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id).populate("subjects");
      if (!student) {
        await Log.create({
          user: req.user?.id,
          action: "student-lookup",
          status: "failed",
          details: `Student not found for ID: ${req.params.id}`,
          ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        });
        return res.status(404).json({ message: "Student not found" });
      }

      await Log.create({
        user: req.user?.id,
        student: student._id,
        action: "student-lookup",
        status: "success",
        details: `Fetched subjects for ${student.name}`,
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      });

      res.json({ subjects: student.subjects });
    } catch (err) {
      await Log.create({
        user: req.user?.id,
        action: "student-lookup",
        status: "failed",
        details: `Error: ${err.message}`,
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      });

      res.status(500).json({ message: "Failed to get student's subjects", error: err.message });
    }
  }
);

module.exports = router;
