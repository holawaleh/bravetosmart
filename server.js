const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/subjects", require("./routes/subjectRoutes")); // ✅ Use consistent lowercase filename
app.use("/api/logs", require("./routes/logRoutes"));

// Root route
app.get("/", (req, res) => {
  res.send("🚀 Backend API is live!");
});

router.post("/create", async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: "Name and code are required" });
    }

    const existing = await Subject.findOne({ $or: [{ name }, { code }] });
    if (existing) {
      return res.status(400).json({ message: "Subject already exists" });
    }

    const subject = await Subject.create({ name, code });

    await Log.create({
      action: "Create Subject",
      details: `Created subject: ${name} (${code})`,
    });

    res.status(201).json({ message: "Subject created successfully", subject });
  } catch (err) {
    console.error("❌ Error creating subject:", err.message, err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
