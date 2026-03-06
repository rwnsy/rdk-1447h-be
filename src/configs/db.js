const mongoose = require("mongoose");

// Module-level cache: Vercel reuses warm Lambda instances between requests,
// so we reuse the existing connection instead of reconnecting every time.
let isConnected = false;

async function connectDB() {
  // Reuse healthy connection on warm Lambda invocations
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("♻️  Reusing existing MongoDB connection");
    return true;
  }

  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  // Disable command buffering BEFORE connecting.
  // Without this, if the connection drops between warm requests, Mongoose silently
  // queues queries for up to 10 000 ms before throwing — producing the
  // "buffering timed out" error. With this set, queries fail immediately instead.
  mongoose.set("bufferCommands", false);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // Time to find a primary MongoDB node
      socketTimeoutMS: 45000, // Max inactivity on an open socket
      maxPoolSize: 10, // Upper bound on pooled connections
      // minPoolSize and maxIdleTimeMS are intentionally omitted:
      //   minPoolSize forces Mongoose to keep live connections, which conflicts
      //   with serverless where the process may be idle for a long time.
      //   maxIdleTimeMS would silently close idle connections, causing the next
      //   warm-Lambda request to see readyState === 1 momentarily, bypass the
      //   connection check, and then hit the 10 000 ms buffer timeout.
      retryWrites: true,
      w: "majority",
    });

    isConnected = true;
    console.log("✅ Connected to MongoDB successfully");

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
      isConnected = false;
    });

    return true;
  } catch (error) {
    isConnected = false;
    console.error("❌ Error connecting to MongoDB:", error.message);
    console.log("⚠️ Server is running without database connection");
    return false;
  }
}

module.exports = connectDB;
