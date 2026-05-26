const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");
const messageRoutes = require("./routes/messageRoutes");
const questionRoutes = require("./routes/questionRoutes");

dotenv.config();
connectDB();

const app = express();

// Enables JSON body parsing for incoming API requests.
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "StudyCircle backend is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/questions", questionRoutes);

// Handles unknown routes with a clean JSON response.
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Centralized error handler for all controllers.
app.use((error, req, res, next) => {
  console.error(error);

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || "Internal server error.",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
