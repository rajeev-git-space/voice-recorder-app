const express = require("express");
const bodyParser = require("body-parser");
const audioRoutes = require("./src/routes/audioRoutes");

const app = express();
app.use(bodyParser.json());

// API Routes
app.use("/api", audioRoutes);

// Health check
app.get("/", (req, res) => res.send("API is running!"));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message });
});

module.exports = app;
