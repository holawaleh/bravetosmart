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
// Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error getting students list" });
  }
});

// Get student by ID
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error getting student" });
  }
});

// Update student
router.put("/:id", async (req, res) => {
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID format" });
    }

    const updateData = {};
    const { name, matricNo, email, level, phone, department } = req.body;

    // Only include fields that are actually provided
    if (name) updateData.name = name.trim();
    if (matricNo) updateData.matricNo = matricNo.trim();
    if (email) updateData.email = email.trim();
    if (level) updateData.level = level.trim();
    if (phone) updateData.phone = phone.trim();
    if (department) updateData.department = department.trim();

    // Validate required fields
    if (!updateData.name || !updateData.matricNo || !updateData.email) {
      return res.status(400).json({
        message: "Name, matricNo, and email are required fields"
      });
    }

    // Check if student exists first
    const existingStudent = await Student.findById(req.params.id);
    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if matricNo or email already exists for another student
    const duplicateCheck = await Student.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { matricNo: updateData.matricNo },
        { email: updateData.email }
      ]
    });

    if (duplicateCheck) {
      const duplicateField = duplicateCheck.matricNo === updateData.matricNo ? 'matricNo' : 'email';
      return res.status(400).json({
        message: `Another student already exists with this ${duplicateField}`
      });
    }

    // Update student with validated fields
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { 
        new: true,           // return updated doc
        runValidators: true, // run schema validations
        context: 'query'     // needed for unique validator
      }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await Log.create({
      user: student._id,
      action: "Student Updated",
      details: `Student updated: ${student.name} (${student.matricNo})`,
    });

    res.json({ message: "Student updated successfully", student });
  } catch (err) {
    console.error('Student update error:', err);
    
    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: messages 
      });
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ 
        message: `A student with this ${field} already exists` 
      });
    }

    // Handle other errors
    res.status(500).json({ 
      message: "Server error updating student",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Delete student
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await Log.create({
      action: "Student Deleted",
      details: `Student deleted: ${student.name} (${student.matricNo})`,
    });

    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error deleting student" });
  }
});

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
