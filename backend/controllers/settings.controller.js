// settings.controller.js
import { db } from "../config/db.js";
import { AuditService } from "../services/auditService.js";

export const getSettings = async (req, res, next) => {
  try {
    const settings = db.getSettings();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const updated = db.updateSettings(req.body);

    AuditService.log({
      officer: updated.officerName || "Alex Singh",
      action: "Settings Updated",
      entity: "Settings",
      entityId: "CONFIG",
      result: "Risk weights & thresholds modified",
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
