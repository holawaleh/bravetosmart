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
      "Fetch Students", // ✅ Add this
      "Fetch Subjects", // ✅ Add this
      "log-summary",     // ✅ if used elsewhere
    ]
  },
  details: { type: String, required: true },
  status: { type: String }, // optional, add enum if needed
  ip: { type: String }      // optional
}, { timestamps: true });

module.exports = mongoose.model("Log", logSchema);
