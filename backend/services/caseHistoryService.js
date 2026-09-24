// caseHistoryService.js
// In-memory case history for verification audit trail
// NOTE: Stores only metadata (verification ID, risk score, decision, timestamps).
// No document images or PII are retained — preserving Zero Document Retention.

import { db } from "../config/db.js";

export class CaseHistoryService {
  // In-memory case store (persisted to store.json via DataStore)
  static addCase(verificationResult) {
    if (!verificationResult || !verificationResult.verificationId) return null;

    const caseRecord = {
      id: verificationResult.verificationId,
      documentType: verificationResult.documentType || "Unknown",
      riskScore: verificationResult.riskScore ?? 0,
      riskLevel: verificationResult.riskLevel || "UNKNOWN",
      recommendation: verificationResult.recommendation || "MANUAL_REVIEW",
      recommendedAction: verificationResult.recommendedAction || "",
      reasons: verificationResult.reasons || [],
      processingTimeMs: verificationResult.processingTimeMs || 0,
      // Signal summary scores (no raw PII)
      signals: {
        ocrConfidence: verificationResult.ocr?.confidence ?? 0,
        ocrFieldsDetected: verificationResult.ocr?.fieldsDetected ?? 0,
        validationScore: verificationResult.validation?.score || "N/A",
        validationStatus: verificationResult.validation?.status || "unknown",
        tamperingScore: verificationResult.tampering?.tamperingScore ?? 0,
        tamperingRisk: verificationResult.tampering?.tamperingRisk || "Low",
        syntheticScore: verificationResult.synthetic?.syntheticScore ?? 0,
        syntheticLevel: verificationResult.synthetic?.suspicionLevel || "LOW_SUSPICION",
        faceSimilarity: verificationResult.faceVerification?.similarity ?? null,
        faceStatus: verificationResult.faceVerification?.status || "NOT PROVIDED",
        watchlistMatched: verificationResult.watchlist?.matched ?? false,
        watchlistStatus: verificationResult.watchlist?.status || "CLEAR",
      },
      // Officer action tracking
      officerAction: null,
      officerNotes: null,
      timestamp: new Date().toISOString(),
    };

    // Persist to datastore
    if (!db.data.cases) {
      db.data.cases = [];
    }
    db.data.cases.unshift(caseRecord); // newest first

    // Keep only last 100 cases to avoid unbounded growth
    if (db.data.cases.length > 100) {
      db.data.cases = db.data.cases.slice(0, 100);
    }

    db.persist();
    return caseRecord;
  }

  static getCases() {
    return db.data.cases || [];
  }

  static getCaseById(caseId) {
    const cases = db.data.cases || [];
    return cases.find((c) => c.id === caseId) || null;
  }

  static updateOfficerAction(caseId, action, notes) {
    const cases = db.data.cases || [];
    const caseRecord = cases.find((c) => c.id === caseId);
    if (!caseRecord) return null;

    caseRecord.officerAction = action;
    caseRecord.officerNotes = notes || null;
    caseRecord.officerActionTimestamp = new Date().toISOString();
    db.persist();
    return caseRecord;
  }

  static getStats() {
    const cases = db.data.cases || [];
    const total = cases.length;
    if (total === 0) {
      return {
        total: 0,
        riskDistribution: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
        decisionDistribution: { PROCEED: 0, MANUAL_REVIEW: 0, HOLD: 0, ESCALATE: 0 },
        averageRiskScore: 0,
        averageProcessingTime: 0,
        recentCases: [],
      };
    }

    const riskDistribution = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    const decisionDistribution = { PROCEED: 0, MANUAL_REVIEW: 0, HOLD: 0, ESCALATE: 0 };
    let totalRisk = 0;
    let totalTime = 0;

    for (const c of cases) {
      const level = (c.riskLevel || "").toUpperCase();
      if (riskDistribution[level] !== undefined) riskDistribution[level]++;
      else riskDistribution["MEDIUM"]++;

      const decision = (c.recommendation || "").toUpperCase();
      if (decisionDistribution[decision] !== undefined) decisionDistribution[decision]++;
      else decisionDistribution["MANUAL_REVIEW"]++;

      totalRisk += c.riskScore || 0;
      totalTime += c.processingTimeMs || 0;
    }

    return {
      total,
      riskDistribution,
      decisionDistribution,
      averageRiskScore: Math.round(totalRisk / total),
      averageProcessingTime: Math.round(totalTime / total),
      recentCases: cases.slice(0, 10),
    };
  }

  static clearAll() {
    db.data.cases = [];
    db.persist();
  }
}
