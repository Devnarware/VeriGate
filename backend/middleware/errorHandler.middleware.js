// errorHandler.middleware.js

export const errorHandler = (err, req, res, next) => {
  // Server-side error logging
  console.error(`[VeriGate Error]: ${err.name || "Error"} - ${err.message || "Internal server error"}`);

  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let safeMessage = "An unexpected error occurred during verification processing.";

  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 413;
    safeMessage = "Uploaded file exceeds the maximum allowed size limit (5 MB).";
  } else if (err.name === "MulterError") {
    statusCode = 400;
    safeMessage = `Upload error: ${err.message}`;
  } else if (err.message && (err.message.includes("Unsupported file type") || err.message.includes("Please upload"))) {
    statusCode = 400;
    safeMessage = err.message;
  } else if (process.env.NODE_ENV !== "production") {
    // Only expose actual message if not a raw system failure leaking paths
    safeMessage = err.message ? err.message.replace(/\/[\w./-]+/g, "[path]") : safeMessage;
  }

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
  });
};
