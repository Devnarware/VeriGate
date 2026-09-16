// auditService.js
// Centralized audit trail recorder for border security events
import { db } from "../config/db.js";

export class AuditService {
  static log({ officer = "Alex Singh", action, entity, entityId, result, ipAddress = "127.0.0.1" }) {
    const entry = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      officer,
      action,
      entity,
      entityId,
      result,
      ipAddress,
    };
    db.insert("auditLogs", entry);
    return entry;
  }

  static getLogs(limit = 100) {
    const logs = db.get("auditLogs");
    return logs.slice(0, limit);
  }
}
