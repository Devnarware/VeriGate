// screening.routes.js
import { Router } from "express";
import { upload } from "../middleware/upload.middleware.js";
import { analyzeDocument } from "../controllers/screening.controller.js";

const router = Router();

// POST /api/screening/analyze — Main document verification endpoint
router.post(
  "/analyze",
  upload.fields([
    { name: "document", maxCount: 1 },
    { name: "livePhoto", maxCount: 1 },
  ]),
  analyzeDocument
);

export default router;
