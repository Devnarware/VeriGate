// audit.routes.js
import { Router } from "express";
import { getAuditLogs } from "../controllers/auditLog.controller.js";

const router = Router();

router.get("/", getAuditLogs);

export default router;
