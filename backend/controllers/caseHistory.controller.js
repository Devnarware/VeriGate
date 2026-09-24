// caseHistory.controller.js
import { CaseHistoryService } from "../services/caseHistoryService.js";

export const getCases = (req, res) => {
  try {
    const { riskLevel, recommendation, search } = req.query;
    let cases = CaseHistoryService.getCases();

    if (riskLevel) {
      cases = cases.filter(
        (c) => (c.riskLevel || "").toUpperCase() === riskLevel.toUpperCase()
      );
    }

    if (recommendation) {
      cases = cases.filter(
        (c) => (c.recommendation || "").toUpperCase() === recommendation.toUpperCase()
      );
    }

    if (search) {
      const q = search.trim().toLowerCase();
      cases = cases.filter(
        (c) =>
          (c.id && c.id.toLowerCase().includes(q)) ||
          (c.documentType && c.documentType.toLowerCase().includes(q)) ||
          (c.officerNotes && c.officerNotes.toLowerCase().includes(q))
      );
    }

    res.status(200).json({
      success: true,
      count: cases.length,
      data: cases,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve case history: " + err.message,
    });
  }
};

export const getCaseById = (req, res) => {
  try {
    const { id } = req.params;
    const caseRecord = CaseHistoryService.getCaseById(id);

    if (!caseRecord) {
      return res.status(404).json({
        success: false,
        message: `Case ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: caseRecord,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve case: " + err.message,
    });
  }
};

export const getCaseStats = (req, res) => {
  try {
    const stats = CaseHistoryService.getStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve case statistics: " + err.message,
    });
  }
};

export const updateOfficerAction = (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: "Officer action is required (e.g. APPROVED, SECONDARY_INSPECTION, REJECTED, ESCALATED)",
      });
    }

    const updated = CaseHistoryService.updateOfficerAction(id, action, notes);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Case ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Officer action recorded successfully",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update officer action: " + err.message,
    });
  }
};

export const clearCases = (req, res) => {
  try {
    CaseHistoryService.clearAll();
    res.status(200).json({
      success: true,
      message: "Case audit history cleared",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to clear case history: " + err.message,
    });
  }
};
