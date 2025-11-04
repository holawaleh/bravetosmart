const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    matricNo: {
      type: String,
      required: [true, 'Matric number is required'],
      trim: true,
      unique: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      unique: true,
      match: [/.+\@.+\..+/, 'Please enter a valid email address']
    },
    level: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    uid: {
      type: String,
      trim: true,
      unique: true,
      sparse: true // allows null/undefined values
    },
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
