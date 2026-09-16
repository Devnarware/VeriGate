// errorHandler.middleware.js

export const errorHandler = (err, req, res, next) => {
  // Safe server-side error logging
  console.error(`[VeriGate Error]: ${err.name || "Error"} - ${err.message || "Internal server error"}`);

  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let safeMessage = err.message || "An internal error occurred during verification processing.";

  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 413;
    safeMessage = "Uploaded file exceeds the maximum allowed size limit (10 MB).";
  } else if (err.name === "MulterError") {
    statusCode = 400;
    safeMessage = `Upload error: ${err.message}`;
  } else if (err.message && err.message.includes("Unsupported file type")) {
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
  });
};
