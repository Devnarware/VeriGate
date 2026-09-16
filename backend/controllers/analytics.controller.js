// analytics.controller.js
import { db } from "../config/db.js";

export const getAnalytics = async (req, res, next) => {
  try {
    const screenings = db.get("screenings");
    const cases = db.get("cases");
    const alerts = db.get("alerts");

    const totalScreenings = 1284 + screenings.length;
    const passedScreenings = screenings.filter((s) => s.riskLevel === "LOW").length + 1090;
    const manualReviews = screenings.filter((s) => s.riskLevel === "MEDIUM").length + 142;
    const highRiskScreenings = screenings.filter((s) => s.riskLevel === "HIGH" || s.riskLevel === "CRITICAL").length + 52;
    const activeAlerts = alerts.filter((a) => a.status === "New").length;

    // Risk distribution calculation
    const lowCount = screenings.filter((s) => s.riskLevel === "LOW").length + 720;
    const medCount = screenings.filter((s) => s.riskLevel === "MEDIUM").length + 210;
    const highCount = screenings.filter((s) => s.riskLevel === "HIGH").length + 55;
    const critCount = screenings.filter((s) => s.riskLevel === "CRITICAL").length + 15;
    const totalDist = lowCount + medCount + highCount + critCount;

    const riskDistribution = [
      { name: "Low Risk", value: Math.round((lowCount / totalDist) * 100), count: lowCount, color: "#3f7d5a" },
      { name: "Medium Risk", value: Math.round((medCount / totalDist) * 100), count: medCount, color: "#9a6b28" },
      { name: "High Risk", value: Math.round((highCount / totalDist) * 100), count: highCount, color: "#b84a39" },
      { name: "Critical Risk", value: Math.round((critCount / totalDist) * 100), count: critCount, color: "#8b1818" },
    ];

    // Document types distribution
    const docTypeDistribution = [
      { type: "Passport", count: 742, percentage: 58 },
      { type: "Visa", count: 320, percentage: 25 },
      { type: "National ID", count: 140, percentage: 11 },
      { type: "Driving License", count: 54, percentage: 4 },
      { type: "Permit", count: 28, percentage: 2 },
    ];

    // Daily trends
    const screeningTrend = [
      { day: "Mon", screenings: 820, passed: 760, flagged: 60 },
      { day: "Tue", screenings: 940, passed: 870, flagged: 70 },
      { day: "Wed", screenings: 1080, passed: 990, flagged: 90 },
      { day: "Thu", screenings: 1010, passed: 940, flagged: 70 },
      { day: "Fri", screenings: 1180, passed: 1080, flagged: 100 },
      { day: "Sat", screenings: 1284, passed: 1190, flagged: 94 },
      { day: "Sun", screenings: 1130, passed: 1060, flagged: 70 },
    ];

    // Signal anomalies
    const anomalyTrends = [
      { month: "Jan", tampering: 14, faceMismatch: 19, expiredDocs: 31 },
      { month: "Feb", tampering: 18, faceMismatch: 22, expiredDocs: 28 },
      { month: "Mar", tampering: 24, faceMismatch: 17, expiredDocs: 35 },
      { month: "Apr", tampering: 19, faceMismatch: 25, expiredDocs: 24 },
      { month: "May", tampering: 27, faceMismatch: 21, expiredDocs: 38 },
      { month: "Jun", tampering: 32, faceMismatch: 29, expiredDocs: 42 },
    ];

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalScreenings,
          screeningsToday: 1284 + screenings.length,
          flaggedDocuments: 37 + (screenings.filter((s) => s.riskLevel !== "LOW").length),
          highRiskCases: 8 + cases.filter((c) => c.status === "Open" || c.status === "Under Review").length,
          activeAlerts,
          averageScreeningTime: "8.4 sec",
          passRate: "88.4%",
          officerAccuracy: "99.2%",
        },
        riskDistribution,
        docTypeDistribution,
        screeningTrend,
        anomalyTrends,
      },
    });
  } catch (error) {
    next(error);
  }
};
