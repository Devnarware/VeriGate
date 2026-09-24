// server.js
// VeriGate — Identity & Document Screening Platform Backend
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";

dotenv.config();

process.on("uncaughtException", (err) => {
  console.error("[VeriGate Global UncaughtException]:", err.message);
});
process.on("unhandledRejection", (reason) => {
  console.error("[VeriGate Global UnhandledRejection]:", reason);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

// Configured CORS Allowlist
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy does not allow access from origin ${origin}`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(morgan("dev"));

// NOTE: Uploads are intentionally NOT served as static files.
// Uploaded documents are processed in-memory / temporary files and deleted immediately
// after verification to protect applicant PII.

// Root and API Info Routes
const apiInfoHandler = (req, res) => {
  res.status(200).json({
    success: true,
    message: "VeriGate Document Screening API",
    healthCheck: "/api/health",
    endpoints: {
      health: "/api/health",
      analyze: "/api/screening/analyze",
      cases: "/api/cases",
      caseStats: "/api/cases/stats",
      watchlist: "/api/watchlist",
    },
  });
};

app.get("/", apiInfoHandler);
app.get("/api", apiInfoHandler);

// Honest System Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    platform: "VeriGate Document Screening Platform",
    status: "operational",
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    modules: {
      ocrExtraction: "Tesseract.js OCR & ICAO Doc 9303 MRZ parser",
      documentValidation: "Rule-based field consistency & expiry validation",
      tamperingDetection: "Heuristic Error Level Analysis (Jimp)",
      syntheticDetection: "Heuristic Laplacian edge variance & texture analysis",
      faceComparison: "Heuristic 64x64 pixel luminance similarity",
      watchlistScreening: "Local prototype test database",
      riskEngine: "Multi-signal weighted risk scoring",
      decisionEngine: "Explainable recommendation engine",
    },
  });
});

// Mount Central API Routes
app.use("/api", apiRouter);

// Centralized Error Handling
app.use(errorHandler);

// Start Server
const server = app.listen(PORT, () => {
  console.log("==================================================");
  console.log(`🛡️  VeriGate Screening Backend Running`);
  console.log(`📡  Server URL: http://localhost:${PORT}`);
  console.log(`🩺  Health Check: http://localhost:${PORT}/api/health`);
  console.log("==================================================");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is in use.`);
  } else {
    console.error("Server error:", err);
  }
});
