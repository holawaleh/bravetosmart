const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: String,
    matricNo: String,
    email: String,
    level: String,
    phone: String,
    department: String,
    uid: String,
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject"
      }
    ]
  },
  { timestamps: true } // ✅ Needed for createdAt sorting
);

module.exports = mongoose.model("Student", studentSchema);
