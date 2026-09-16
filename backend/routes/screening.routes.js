// screening.routes.js
import { Router } from "express";
import {
  analyzeDocument,
  getScreeningHistory,
  getScreeningById,
  getDemoScenarios,
} from "../controllers/screening.controller.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

// Multi-file upload: document (mandatory for real uploads) and livePhoto (optional)
const uploadFields = upload.fields([
  { name: "document", maxCount: 1 },
  { name: "livePhoto", maxCount: 1 },
]);

router.post("/analyze", uploadFields, analyzeDocument);
router.get("/history", getScreeningHistory);
router.get("/scenarios", getDemoScenarios);
router.get("/:id", getScreeningById);

export default router;
