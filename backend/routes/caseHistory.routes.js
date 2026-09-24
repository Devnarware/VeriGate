// caseHistory.routes.js
import { Router } from "express";
import {
  getCases,
  getCaseById,
  getCaseStats,
  updateOfficerAction,
  clearCases,
} from "../controllers/caseHistory.controller.js";

const router = Router();

// GET /api/cases — list all audit cases (with optional filtering)
router.get("/", getCases);

// GET /api/cases/stats — aggregate statistics for officer dashboard & recharts
router.get("/stats", getCaseStats);

// GET /api/cases/:id — retrieve single case audit record
router.get("/:id", getCaseById);

// POST /api/cases/:id/action — record officer manual review action / decision note
router.post("/:id/action", updateOfficerAction);

// POST /api/cases/clear — clear audit log (demo reset)
router.post("/clear", clearCases);

export default router;
