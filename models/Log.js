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
  "scan", "register", "deny", "edit", "delete", "login", "logout",
  "assign-subject", "unassign-subject", "subject-create", "subject-fetch",
  "uid-fetch", "uid-capture", "student-fetch", "student-lookup", "student-update",
  "student-delete", "student-create", "student-assign", "student-unassign",
  "student-verify", "student-verify-fail", "student-verify-success", "student-verify-deny", 
  "entry", "exit", "attendance", "attendance-update"
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
