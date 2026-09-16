// report.routes.js
import { Router } from "express";
import { getReports, generateReport } from "../controllers/report.controller.js";

const router = Router();

router.get("/", getReports);
router.post("/generate", generateReport);

export default router;
