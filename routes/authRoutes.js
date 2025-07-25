const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyToken, permit } = require("../middleware/auth");

const router = express.Router();

// 🔐 Register admin (Only superadmin can create admins)
router.post("/register", verifyToken, permit("superadmin"), async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword, role });
    res.status(201).json({ message: "User registered", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// 🔐 Login (Open to all)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// 🔐 Delete admin (Only superadmin can remove admins)
router.delete("/admin/:id", verifyToken, permit("superadmin"), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Admin removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete", error: err.message });
  }
});

module.exports = router;
