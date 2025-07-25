

const express = require("express"); // import express to create our server
const dotenv = require("dotenv"); // load variables from .env file
const cors = require("cors"); // allow requests from frontend
const connectDB = require("./config/db"); // our custom MongoDB connection file
const studentRoutes = require("./routes/studentRoutes"); // import student routes

const subjectRoutes = require("./routes/SubjectRoutes");

const authRoutes = require("./routes/authRoutes");

dotenv.config(); // this loads .env variables like MONGO_URI

connectDB(); // connect to MongoDB Atlas

const app = express(); // create the server app

app.use("/api/auth", authRoutes);

app.use(cors()); // allow frontend to communicate with backend
app.use(express.json()); // allow server to read JSON data from POST requests

app.use("/api/subjects", subjectRoutes);

app.use("/api/students", studentRoutes); // when user goes to /api/students → handle with our routes

const PORT = process.env.PORT || 5000; // use port from .env or default to 5000

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
