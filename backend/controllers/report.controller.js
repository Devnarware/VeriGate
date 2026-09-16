// report.controller.js
import { db } from "../config/db.js";
import { AuditService } from "../services/auditService.js";

export const getReports = async (req, res, next) => {
  try {
    const reports = [
      {
        id: "REP-2026-001",
        title: "Daily Identity Screening Summary",
        category: "Daily Operations",
        dateGenerated: new Date().toISOString().split("T")[0],
        totalRecords: 1284,
        flaggedCount: 37,
        format: "PDF / CSV",
        generatedBy: "Alex Singh",
        status: "Available",
      },
      {
        id: "REP-2026-002",
        title: "High-Risk & Forged Document Incident Audit",
        category: "Security Forensics",
        dateGenerated: new Date().toISOString().split("T")[0],
        totalRecords: 18,
        flaggedCount: 18,
        format: "PDF",
        generatedBy: "Commander V. Rao",
        status: "Available",
      },
      {
        id: "REP-2026-003",
        title: "Biometric & Tampering Anomaly Digest",
        category: "AI Signal Performance",
        dateGenerated: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        totalRecords: 42,
        flaggedCount: 42,
        format: "PDF / JSON",
        generatedBy: "System Automated Engine",
        status: "Available",
      },
      {
        id: "REP-2026-004",
        title: "Interpol & Border Watchlist Hit Log",
        category: "Watchlist Intelligence",
        dateGenerated: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
        totalRecords: 5,
        flaggedCount: 5,
        format: "PDF",
        generatedBy: "Alex Singh",
        status: "Available",
      },
    ];

    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    next(error);
  }
};

export const generateReport = async (req, res, next) => {
  try {
    const { reportType, dateFrom, dateTo } = req.body;
    const reportId = `REP-2026-${Math.floor(100 + Math.random() * 900)}`;

    AuditService.log({
      officer: "Alex Singh",
      action: "Report Generated",
      entity: "Report",
      entityId: reportId,
      result: `Generated '${reportType || "Custom Report"}'`,
    });

    res.status(200).json({
      success: true,
      message: "Report generated successfully",
      data: {
        id: reportId,
        title: reportType || "Verification Summary Report",
        generatedAt: new Date().toISOString(),
        dateRange: `${dateFrom || "2026-03-01"} to ${dateTo || "2026-03-15"}`,
        totalProcessed: 1284,
        lowRiskCount: 1190,
        mediumRiskCount: 65,
        highRiskCount: 21,
        criticalRiskCount: 8,
        tamperingDetectedCount: 16,
        faceMismatchCount: 19,
        status: "Ready for Download",
      },
    });
  } catch (error) {
    next(error);
  }
};
