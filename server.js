const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Route imports
const studentRoutes = require("./routes/studentRoutes");
const subjectRoutes = require("./routes/SubjectRoutes");
const authRoutes = require("./routes/authRoutes");
const logRoutes = require("./routes/logRoutes");

dotenv.config(); // Load .env variables
connectDB(); // Connect to MongoDB

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Important: put this before routes to parse JSON

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/logs", logRoutes);

// Root route (optional)
app.get("/", (req, res) => {
  res.send("🚀 Backend API is live!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
