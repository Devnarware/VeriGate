// upload.middleware.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

const MIME_TO_EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize extension and protect against path traversal
    const rawExt = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ALLOWED_EXTS.includes(rawExt) ? rawExt : (MIME_TO_EXT[file.mimetype] || ".jpg");
    const randomHex = Math.random().toString(16).substring(2, 10);
    const uniqueName = `vg-up-${Date.now()}-${randomHex}${safeExt}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const isMimeAllowed = ALLOWED_MIMES.includes(file.mimetype);
  const rawExt = path.extname(file.originalname || "").toLowerCase();
  const isExtAllowed = !rawExt || ALLOWED_EXTS.includes(rawExt);

  if (isMimeAllowed && isExtAllowed) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type or extension. Only standard JPG, PNG, WEBP, or PDF are accepted."), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});
