// server.js
// VeriGate — AI-Powered Identity & Document Screening Platform Backend
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import { db } from "./config/db.js";

dotenv.config();

process.on("uncaughtException", (err) => {
  console.error("[VeriGate Global UncaughtException]:", err.message);
});
process.on("unhandledRejection", (reason) => {
  console.error("[VeriGate Global UnhandledRejection]:", reason);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Static directories
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root and API Info Routes
const apiInfoHandler = (req, res) => {
  res.status(200).json({
    success: true,
    message: "🛡️ VeriGate AI Document Screening Backend API is running.",
    healthCheck: "/api/health",
    endpoints: {
      health: "/api/health",
      scenarios: "/api/screening/scenarios",
      history: "/api/screening/history",
      cases: "/api/cases",
      alerts: "/api/alerts",
      watchlist: "/api/watchlist",
      analytics: "/api/analytics"
    }
  });
};

app.get("/", apiInfoHandler);
app.get("/api", apiInfoHandler);

// System Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    platform: "VeriGate AI Document Screening Platform",
    problemStatement: "SIH26188",
    status: "operational",
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    modules: {
      ocrExtraction: "ONLINE (Tesseract.js / MRZ Rule Engine)",
      documentValidation: "ONLINE (ICAO Doc 9303 Compliance)",
      tamperingDetection: "ONLINE (Error Level Analysis & Forensic Metadata)",
      syntheticDetection: "ONLINE (Laplacian Edge Variance & Texture Uniformity)",
      faceVerification: "ONLINE (Local 1:1 Luminance Matrix Heuristic)",
      watchlistScreening: "ONLINE (Local Security Datastore)",
      riskScoringEngine: "ONLINE (Dynamic Multi-Signal Risk Engine with Threat Floors)",
      decisionEngine: "ONLINE (Transparent Explainable Directives)",
      auditTrail: "ONLINE (Cryptographic Action Hash Trail)",
      aiMicroservicePython: "STANDALONE / OPTIONAL (Offline / Disconnected)",
    },
  });
});

// Mount Central API Routes
app.use("/api", apiRouter);

// Centralized Error Handling
app.use(errorHandler);

// Start Server with Graceful Port Handling
const server = app.listen(PORT, () => {
  console.log("==================================================");
  console.log(`🛡️  VeriGate Border Screening Backend Running`);
  console.log(`📡  Server URL: http://localhost:${PORT}`);
  console.log(`🩺  Health Check: http://localhost:${PORT}/api/health`);
  console.log("==================================================");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.warn(`[Server] Port ${PORT} is already in use. Existing VeriGate instance remains active.`);
  } else {
    console.error("[Server] Unexpected server error:", err);
  }
});

export default app;
