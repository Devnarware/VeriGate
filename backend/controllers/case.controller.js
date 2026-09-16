// case.controller.js
import { db } from "../config/db.js";
import { AuditService } from "../services/auditService.js";

export const getCases = async (req, res, next) => {
  try {
    const { search, status, risk, documentType } = req.query;
    let list = db.get("cases");

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.id?.toLowerCase().includes(q) ||
          c.personName?.toLowerCase().includes(q) ||
          c.documentNumber?.toLowerCase().includes(q) ||
          c.verificationId?.toLowerCase().includes(q)
      );
    }

    if (status && status !== "ALL") {
      list = list.filter((c) => c.status?.toLowerCase() === status.toLowerCase());
    }

    if (risk && risk !== "ALL") {
      list = list.filter((c) => c.riskLevel?.toUpperCase() === risk.toUpperCase());
    }

    if (documentType && documentType !== "ALL") {
      list = list.filter((c) => c.documentType?.toLowerCase() === documentType.toLowerCase());
    }

    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

export const getCaseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = db.findById("cases", id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const createCase = async (req, res, next) => {
  try {
    const {
      verificationId,
      personName,
      documentType,
      documentNumber,
      riskScore,
      riskLevel,
      recommendation,
      reasons,
      evidence,
      notes,
      assignedOfficer,
    } = req.body;

    const caseCount = db.get("cases").length + 1;
    const caseId = `CASE-2026-${String(caseCount).padStart(3, "0")}`;

    const newCase = {
      id: caseId,
      caseId,
      verificationId: verificationId || `VG-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      personName: personName || "Unnamed Subject",
      documentType: documentType || "Passport",
      documentNumber: documentNumber || "N/A",
      riskScore: riskScore !== undefined ? riskScore : 50,
      riskLevel: riskLevel || "MEDIUM",
      recommendation: recommendation || "MANUAL REVIEW",
      status: "Open",
      assignedOfficer: assignedOfficer || "Alex Singh",
      createdTime: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      reasons: reasons || ["Flagged during border identity screening."],
      evidence: evidence || ["Uploaded document inspection log."],
      notes: notes || "Case opened by officer for secondary review.",
    };

    db.insert("cases", newCase);

    AuditService.log({
      officer: assignedOfficer || "Alex Singh",
      action: "Case Created",
      entity: "Case",
      entityId: caseId,
      result: `Created for ${newCase.personName} (${newCase.riskLevel} Risk)`,
    });

    res.status(201).json({ success: true, data: newCase });
  } catch (error) {
    next(error);
  }
};

export const updateCase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.findById("cases", id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    const updated = db.update("cases", id, req.body);

    AuditService.log({
      officer: req.body.assignedOfficer || existing.assignedOfficer || "Alex Singh",
      action: "Case Updated",
      entity: "Case",
      entityId: id,
      result: `Status updated to '${updated.status}'`,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
