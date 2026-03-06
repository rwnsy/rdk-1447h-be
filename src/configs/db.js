const mongoose = require("mongoose");

async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    // Optimized for Vercel serverless environment
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout for finding a server
      socketTimeoutMS: 45000, // Close socket after inactivity
      maxPoolSize: 10, // Maximum number of connections
      minPoolSize: 2, // Minimum number of connections
      maxIdleTimeMS: 10000, // Close idle connections after 10s
      retryWrites: true, // Retry write operations
      w: "majority", // Write concern
    });

    console.log("✅ Connected to MongoDB successfully");

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

    return true;
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    console.log("⚠️ Server is running without database connection");
    return false;
  }
}

module.exports = connectDB;
