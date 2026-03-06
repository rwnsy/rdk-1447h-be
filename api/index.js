require("dotenv").config();
const express = require("express");
const connectDB = require("../src/configs/db");
const mongoose = require("mongoose");
const articleRoutes = require("../src/routes/articleRoute");
const donationRoutes = require("../src/routes/donationRoutes");
const galleryRoutes = require("../src/routes/galleryRoutes");
const cors = require("cors");

process.env.TZ = "Asia/Jakarta";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(articleRoutes);
app.use(donationRoutes);
app.use(galleryRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RDK 1447-H API is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "RDK 1447-H API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
const multer = require("multer");
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Ukuran file melebihi batas maksimal 5MB.",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: `Field gambar tidak dikenal: '${err.field}'. Periksa nama field yang digunakan di Postman.`,
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

// Database connection - Vercel akan handle koneksi per request
let isConnected = false;

async function ensureConnection() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    const dbConnected = await connectDB();
    if (dbConnected) {
      isConnected = true;
      return true;
    }
    return false;
  } catch (error) {
    console.error("❌ Database connection error:", error);
    return false;
  }
}

// Middleware untuk memastikan database terkoneksi sebelum setiap request
app.use(async (req, res, next) => {
  const connected = await ensureConnection();
  if (!connected) {
    return res.status(503).json({
      success: false,
      message: "Database connection unavailable",
    });
  }
  next();
});

// Export untuk Vercel serverless function
module.exports = app;
