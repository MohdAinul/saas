import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import userRoutes from "./src/routes/user.js";
import aiRoutes from "./src/routes/ai.js";

const app = express();

// Database Connection
connectDB();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health Check Route
app.get("/", (req, res) => {
  res.send("CareerAI Backend is running");
});

// API Routes
app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);

const port = process.env.PORT || 7000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
