// models/Log.js
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin/Superadmin who performed the action
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student", // Student affected (optional)
    },
    action: {
      type: String,
      required: true,
      enum: [
        // General actions
        "scan", "register", "deny", "edit", "delete", "login", "logout",

        // Subject-related
        "assign-subject", "unassign-subject", "subject-create", "subject-fetch",

        // UID-related
        "uid-fetch", "uid-capture",

        // Student-related
        "student-fetch", "student-lookup", "student-update", "student-delete",
        "student-create", "student-assign", "student-unassign",
        "student-verify", "student-verify-fail", "student-verify-success", "student-verify-deny",

        // Attendance-related
        "entry", "exit", "attendance", "attendance-update",

        // ✅ Missing values used in routes
        "log-fetch", "log-summary", "test-log"
      ]
    },
    status: {
      type: String,
      enum: ["success", "failed", "denied"],
    },
    details: {
      type: String,
    },
    ip: {
      type: String, // Optional: capture IP address for security
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Add indexes for faster lookups
logSchema.index({ student: 1 });
logSchema.index({ user: 1 });
logSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Log", logSchema);
