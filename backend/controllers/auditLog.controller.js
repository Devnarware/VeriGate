// auditLog.controller.js
import { AuditService } from "../services/auditService.js";

export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = AuditService.getLogs();
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};
