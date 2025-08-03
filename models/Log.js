const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: false },
  action: {
    type: String,
    required: true,
    enum: [
      "UID Capture",
      "UID Fetch",
      "Student Registered",
      "UID Lookup Success",
      "UID Lookup Failed",
      "Registration Denied",
      "Fetch Students",
      "Fetch Subjects",
      "log-summary",
      "log-fetch",     // ✅ now included
      "test-log",      // ✅ now included
      "entry",         // ✅ needed for summary counts
      "exit"           // ✅ needed for summary counts
    ]
  },
  details: { type: String, required: true },
  status: {
    type: String,
    enum: ["success", "failed"],
    required: false
  },
  ip: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Log", logSchema);
