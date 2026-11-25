import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dns from "node:dns";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

// Configure DNS to use Cloudflare
dns.setServers(["1.1.1.1"]);

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Welcome to WorkSpot API!");
});

// Start server after connecting to MongoDB
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`WorkSpot server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
