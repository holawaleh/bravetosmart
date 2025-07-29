const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/subjects", require("./routes/SubjectRoutes"));
app.use("/api/logs", require("./routes/logRoutes"));

// ✅ Mount student routes directly under /api
app.use("/api", require("./routes/studentRoutes")); // All student endpoints live under /api

// Root route
app.get("/", (req, res) => {
  res.send("🚀 Backend API is live!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});