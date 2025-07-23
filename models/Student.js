// models/Student.js

const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  matricNo: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  level: {
    type: String, // ← Fixed here
  },
  phone: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  uid: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
