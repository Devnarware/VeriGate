// case.routes.js
import { Router } from "express";
import {
  getCases,
  getCaseById,
  createCase,
  updateCase,
} from "../controllers/case.controller.js";

const router = Router();

router.get("/", getCases);
router.post("/", createCase);
router.get("/:id", getCaseById);
router.patch("/:id", updateCase);

export default router;
