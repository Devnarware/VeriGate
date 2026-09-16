// riskEngine.js
// Centralized multi-signal weighted risk scoring engine
// Traceable signal contributions & conservative handling of missing signals

import { db } from "../config/db.js";

function sanitizeNumber(val, defaultVal, min = 0, max = 100) {
  if (typeof val !== "number" || !Number.isFinite(val) || Number.isNaN(val)) {
    return defaultVal;
  }
  return Math.max(min, Math.min(max, val));
}

export class RiskEngine {
  /**
   * Calculate composite risk score
   * @param {object} signals - Structured findings from OCR, Validation, Tampering, Face, Watchlist
   * @param {string|null} scenario - SIH demo scenario or null for real
   */
  static calculate(signals = {}, scenario = null) {
    if (!signals || typeof signals !== "object") {
      signals = {};
    }
    // =========================================================================
    // BRANCH A: DETERMINISTIC SIH DEMO SCENARIOS
    // =========================================================================
    if (scenario === "scenario-1") {
      return {
        riskScore: 18,
        riskLevel: "LOW",
        signalScores: {
          ocrPenalty: 2,
          validationPenalty: 3,
          tamperingPenalty: 4,
          facePenalty: 4,
          watchlistPenalty: 0,
        },
        signalContributions: {
          ocr: { score: 98, penalty: 2, weight: 15, weightedPoints: 2 },
          validation: { score: 96, penalty: 4, weight: 20, weightedPoints: 3 },
          tampering: { score: 6, penalty: 6, weight: 30, weightedPoints: 4 },
          face: { score: 96, penalty: 4, weight: 25, weightedPoints: 4 },
          watchlist: { matched: false, penalty: 0, weight: 10, weightedPoints: 0 },
        },
        signalEvidence: {
          ocr: { status: "PASS", confidence: 0.98, fieldsDetected: 6 },
          validation: { status: "PASS", anomalies: [], numericScore: 96 },
          tampering: { status: "LOW", score: 6, indicators: [] },
          face: { status: "MATCH", similarity: 96, isProvided: true },
          watchlist: { status: "CLEAR", match: false },
        },
        weights: { ocr: 15, validation: 20, tampering: 30, face: 25, watchlist: 10 },
      };
    }

    if (scenario === "scenario-2") {
      return {
        riskScore: 47,
        riskLevel: "MEDIUM",
        signalScores: {
          ocrPenalty: 8,
          validationPenalty: 14,
          tamperingPenalty: 12,
          facePenalty: 13,
          watchlistPenalty: 0,
        },
        signalContributions: {
          ocr: { score: 92, penalty: 8, weight: 15, weightedPoints: 5 },
          validation: { score: 72, penalty: 28, weight: 20, weightedPoints: 14 },
          tampering: { score: 34, penalty: 34, weight: 30, weightedPoints: 12 },
          face: { score: 68, penalty: 32, weight: 25, weightedPoints: 13 },
          watchlist: { matched: false, penalty: 0, weight: 10, weightedPoints: 0 },
        },
        signalEvidence: {
          ocr: { status: "PASS", confidence: 0.92, fieldsDetected: 5 },
          validation: { status: "UNCERTAIN", anomalies: [{ rule: "STAY_DURATION_MISMATCH", severity: "Medium", message: "Visa duration contradicts immigration stamp" }], numericScore: 72 },
          tampering: { status: "MODERATE", score: 34, indicators: ["Possible font variance in issuing authority region"] },
          face: { status: "UNCERTAIN", similarity: 68, isProvided: true },
          watchlist: { status: "CLEAR", match: false },
        },
        weights: { ocr: 15, validation: 20, tampering: 30, face: 25, watchlist: 10 },
      };
    }

    if (scenario === "scenario-3") {
      return {
        riskScore: 74,
        riskLevel: "HIGH",
        signalScores: {
          ocrPenalty: 10,
          validationPenalty: 18,
          tamperingPenalty: 23,
          facePenalty: 17,
          watchlistPenalty: 6,
        },
        signalContributions: {
          ocr: { score: 84, penalty: 16, weight: 15, weightedPoints: 10 },
          validation: { score: 60, penalty: 40, weight: 20, weightedPoints: 18 },
          tampering: { score: 76, penalty: 76, weight: 30, weightedPoints: 23 },
          face: { score: 52, penalty: 48, weight: 25, weightedPoints: 17 },
          watchlist: { matched: true, penalty: 60, weight: 10, weightedPoints: 6 },
        },
        signalEvidence: {
          ocr: { status: "PARTIAL", confidence: 0.84, fieldsDetected: 4 },
          validation: { status: "FAIL", anomalies: [{ rule: "MRZ_CHECKSUM_ANOMALY", severity: "High", message: "MRZ checksum mismatch" }], numericScore: 60 },
          tampering: { status: "HIGH", score: 76, indicators: ["Localized compression artifacts on date fields"] },
          face: { status: "MISMATCH", similarity: 52, isProvided: true },
          watchlist: { status: "CLEAR", match: false },
        },
        weights: { ocr: 15, validation: 20, tampering: 30, face: 25, watchlist: 10 },
      };
    }

    if (scenario === "scenario-4") {
      return {
        riskScore: 92,
        riskLevel: "CRITICAL",
        signalScores: {
          ocrPenalty: 14,
          validationPenalty: 22,
          tamperingPenalty: 27,
          facePenalty: 19,
          watchlistPenalty: 10,
        },
        signalContributions: {
          ocr: { score: 78, penalty: 22, weight: 15, weightedPoints: 14 },
          validation: { score: 54, penalty: 46, weight: 20, weightedPoints: 22 },
          tampering: { score: 89, penalty: 89, weight: 30, weightedPoints: 27 },
          face: { score: 38, penalty: 62, weight: 25, weightedPoints: 19 },
          watchlist: { matched: true, penalty: 100, weight: 10, weightedPoints: 10 },
        },
        signalEvidence: {
          ocr: { status: "FAIL", confidence: 0.78, fieldsDetected: 3 },
          validation: { status: "FAIL", anomalies: [{ rule: "COUNTERFEIT_SECURITY_FEATURES", severity: "High", message: "Substrate anomalies detected" }], numericScore: 54 },
          tampering: { status: "HIGH", score: 89, indicators: ["Severe physical and digital tampering indicators detected"] },
          face: { status: "MISMATCH", similarity: 38, isProvided: true },
          watchlist: { status: "ALERT", match: true },
        },
        weights: { ocr: 15, validation: 20, tampering: 30, face: 25, watchlist: 10 },
      };
    }

    // =========================================================================
    // BRANCH B: REAL MULTI-SIGNAL DYNAMIC RISK CALCULATION
    // =========================================================================
    const settings = db.getSettings();
    const weights = {
      ocr: settings.weights?.ocr ?? 10,
      validation: settings.weights?.validation ?? 25,
      tampering: settings.weights?.tampering ?? 20,
      synthetic: settings.weights?.synthetic ?? 15,
      face: settings.weights?.face ?? 20,
      watchlist: settings.weights?.watchlist ?? 10,
    };
    const thresholds = settings.thresholds || {
      low: 30,
      medium: 60,
      high: 80,
    };

    const totalWeight =
      weights.ocr +
      weights.validation +
      weights.tampering +
      weights.synthetic +
      weights.face +
      weights.watchlist;

    // 1. OCR Risk Contribution
    let ocrPenalty = 0;
    const ocrConf = sanitizeNumber(signals.ocr?.confidence, 0.5, 0.0, 1.0);
    const ocrFields = sanitizeNumber(signals.ocr?.fieldsDetected, 0, 0, 20);
    const ocrStatus = signals.ocr?.ocrStatus || "UNKNOWN";

    if (ocrStatus === "FAILED_NO_FILE" || ocrStatus === "FAILED_PROCESSING_ERROR") {
      ocrPenalty = 50; // Uncertainty/unavailable, not fraud
    } else if (ocrStatus === "LOW_CONFIDENCE" || ocrFields === 0) {
      ocrPenalty = 45; // Uncertainty
    } else if (ocrFields < 3) {
      ocrPenalty = 30; // Partial extraction
    } else {
      // Clean OCR extraction: minimal penalty proportional to unextracted confidence
      ocrPenalty = Math.max(0, Math.min(20, Math.round((1 - ocrConf) * 25)));
    }
    const ocrPoints = Math.round((ocrPenalty * weights.ocr) / totalWeight);

    // 2. Document Validation Risk Contribution
    let valPenalty = 0;
    const valScore = sanitizeNumber(signals.validation?.numericScore, 50, 0, 100);
    const hasHighIssue = signals.validation?.issues?.some((i) => i.severity === "High");
    const isExpired = signals.validation?.issues?.some((i) => i.rule === "DOCUMENT_EXPIRED");
    const verifiedFailedChecksumCount =
      typeof signals.validation?.verifiedFailedChecksumCount === "number"
        ? signals.validation.verifiedFailedChecksumCount
        : (typeof signals.validation?.failedChecksumCount === "number" ? signals.validation.failedChecksumCount : 0);
    const checksumVerifiedIssueCount = signals.validation?.issues?.filter(
      (i) => i.rule?.includes("MRZ") && i.rule?.includes("CHECK_DIGIT_FAILED") && !i.rule?.includes("COMPOSITE")
    ).length || 0;
    const hasMultipleChecksumFailures = Boolean(
      signals.validation?.hasMultipleChecksumFailures ||
      verifiedFailedChecksumCount >= 2 ||
      checksumVerifiedIssueCount >= 2
    );
    const hasVerifiedChecksumFail = Boolean(
      signals.validation?.hasVerifiedChecksumFail ||
      signals.validation?.hasChecksumFail ||
      verifiedFailedChecksumCount >= 1 ||
      signals.validation?.issues?.some((i) => i.rule?.includes("MRZ") && i.rule?.includes("CHECK_DIGIT_FAILED"))
    );
    const hasChecksumFail = hasVerifiedChecksumFail;
    const hasChecksumUncertainty = Boolean(
      signals.validation?.hasChecksumUncertainty ||
      (signals.validation?.checksumUncertaintyCount && signals.validation.checksumUncertaintyCount > 0) ||
      signals.validation?.issues?.some((i) => i.rule === "MRZ_CHECK_DIGIT_UNCERTAIN" || i.rule === "MRZ_UNAVAILABLE")
    );

    if (hasMultipleChecksumFailures) {
      valPenalty = 98; // Systematic cryptographic forgery of MRZ
    } else if (hasVerifiedChecksumFail) {
      valPenalty = 85; // Verified check digit failed
    } else if (isExpired) {
      valPenalty = 85; // Explicit illegal travel on expired credential
    } else if (hasHighIssue) {
      valPenalty = Math.max(75, 100 - valScore);
    } else if (hasChecksumUncertainty) {
      // Uncertainty penalty is moderate, requiring review without false fraud floor
      valPenalty = Math.max(45, 100 - valScore);
    } else if (signals.validation?.issues?.length > 0) {
      valPenalty = Math.max(35, 100 - valScore);
    } else {
      valPenalty = Math.max(0, 100 - valScore);
    }
    const valPoints = Math.round((valPenalty * weights.validation) / totalWeight);

    // 3. Tampering Forensics Risk Contribution
    const tamperingScore = sanitizeNumber(signals.tampering?.tamperingScore, 5, 0, 100);
    const tamperingPenalty = Math.max(0, Math.min(100, tamperingScore));
    const tamperingPoints = Math.round((tamperingPenalty * weights.tampering) / totalWeight);

    // 4. Synthetic Document Detection Risk Contribution
    const syntheticScore = sanitizeNumber(signals.synthetic?.syntheticScore, 10, 0, 100);
    const syntheticPenalty = Math.max(0, Math.min(100, syntheticScore));
    const syntheticPoints = Math.round((syntheticPenalty * weights.synthetic) / totalWeight);

    // 5. Biometric Face Verification Risk Contribution
    let facePenalty = 0;
    const isFaceProvided = Boolean(signals.faceVerification?.isProvided);
    const rawFaceSim = signals.faceVerification?.similarity;
    const faceSim = typeof rawFaceSim === "number" && Number.isFinite(rawFaceSim)
      ? sanitizeNumber(rawFaceSim, null, 0, 100)
      : null;
    const faceStatus = signals.faceVerification?.status;
    const isFaceMismatch =
      (isFaceProvided && typeof faceSim === "number" && faceSim < 60) ||
      faceStatus === "Mismatch / Suspect" ||
      signals.faceVerification?.evidenceStatus === "MISMATCH";

    if (!isFaceProvided || faceStatus === "NOT PROVIDED" || signals.faceVerification?.evidenceStatus === "NOT_PROVIDED") {
      // Missing biometric evidence is an UNCERTAINTY, not fraud.
      // Modest uncertainty penalty of 25 (contributes ~5-6 points out of 100)
      facePenalty = 25;
    } else if (isFaceMismatch) {
      // Serious threat: live presenter diverges from passport portrait
      facePenalty = Math.max(85, Math.min(100, Math.round(85 + (60 - (faceSim || 40)) * 0.5)));
    } else if (typeof faceSim === "number") {
      if (faceSim >= 80) {
        // Strong biometric similarity: minimal risk
        facePenalty = Math.max(0, Math.round((100 - faceSim) * 0.4));
      } else {
        // Uncertain / moderate similarity: requires manual visual confirmation
        facePenalty = Math.round(35 + (80 - faceSim) * 1.5);
      }
    } else {
      facePenalty = 35; // Indeterminate
    }
    const facePoints = Math.round((facePenalty * weights.face) / totalWeight);

    // 6. Watchlist Risk Contribution
    const isWatchlistHit = Boolean(signals.watchlist?.matched);
    const watchlistPenalty = isWatchlistHit ? 100 : 0;
    const watchlistPoints = Math.round((watchlistPenalty * weights.watchlist) / totalWeight);

    // Aggregate baseline composite risk score (weighted formula)
    let rawBase = ocrPoints + valPoints + tamperingPoints + syntheticPoints + facePoints + watchlistPoints;
    if (!Number.isFinite(rawBase) || Number.isNaN(rawBase)) {
      rawBase = 50;
    }
    const baseScore = Math.max(5, Math.min(100, Math.round(rawBase)));

    // =========================================================================
    // SEVERE THREAT FLOOR OVERRIDES (NON-DILUTION SECURITY RULES)
    // A severe security failure in any domain must never be averaged away into LOW risk.
    // =========================================================================
    let threatFloor = 0;
    const threatRulesApplied = [];

    // Rule 1: Confirmed watchlist hit immediately forces CRITICAL
    if (isWatchlistHit) {
      threatFloor = Math.max(threatFloor, 92);
      threatRulesApplied.push("WATCHLIST_HIT");
    }

    // Rule 2: Compound Fraud Vectors (Multi-signal corroborated attack)
    const isCompoundFraud =
      (hasVerifiedChecksumFail && isFaceMismatch) ||
      (hasVerifiedChecksumFail && syntheticScore >= 70) ||
      (hasMultipleChecksumFailures && (isFaceMismatch || syntheticScore >= 50 || tamperingScore >= 50)) ||
      (isFaceMismatch && (syntheticScore >= 70 || tamperingScore >= 60));

    if (isCompoundFraud) {
      threatFloor = Math.max(threatFloor, 90);
      threatRulesApplied.push("COMPOUND_FRAUD_DETECTED");
    }

    // Rule 3: Multiple independent MRZ check digit failures (Systematic ICAO cryptographic failure)
    if (hasMultipleChecksumFailures) {
      threatFloor = Math.max(threatFloor, 85);
      threatRulesApplied.push("MULTIPLE_MRZ_CHECKSUM_FAILURES");
    }

    // Rule 4: Single MRZ check digit failure (Altered document number, DOB, or Expiry)
    if (hasVerifiedChecksumFail && !hasMultipleChecksumFailures) {
      threatFloor = Math.max(threatFloor, 65);
      threatRulesApplied.push("SINGLE_MRZ_CHECKSUM_FAILURE");
    }

    // Rule 5: Biometric face mismatch (Only when live photo was provided and similarity < 60%)
    if (isFaceMismatch) {
      threatFloor = Math.max(threatFloor, 65);
      threatRulesApplied.push("BIOMETRIC_FACE_MISMATCH");
    }

    // Rule 6: High physical or digital tampering
    if (tamperingScore >= 80) {
      threatFloor = Math.max(threatFloor, 85);
      threatRulesApplied.push("CRITICAL_TAMPERING_SUSPICION");
    } else if (tamperingScore >= 60) {
      threatFloor = Math.max(threatFloor, 65);
      threatRulesApplied.push("HIGH_TAMPERING_SUSPICION");
    }

    // Rule 7: High synthetic document suspicion (Spatial Laplacian variance / texture uniformity)
    if (syntheticScore >= 70) {
      threatFloor = Math.max(threatFloor, 70);
      threatRulesApplied.push("HIGH_SYNTHETIC_SUSPICION");
    }

    // Rule 8: Document expired (Illegal travel credential)
    if (isExpired) {
      threatFloor = Math.max(threatFloor, 55);
      threatRulesApplied.push("DOCUMENT_EXPIRED");
    }

    // Rule 9: Catastrophic validation failure (Score <= 30)
    if (valScore <= 30 && !threatRulesApplied.includes("MULTIPLE_MRZ_CHECKSUM_FAILURES")) {
      threatFloor = Math.max(threatFloor, 80);
      threatRulesApplied.push("CATASTROPHIC_VALIDATION_FAILURE");
    }

    // Final Composite Score: Highest of Base Weighted Score or Active Severe Threat Floor
    let compositeScore = Math.max(baseScore, threatFloor);
    compositeScore = Math.max(5, Math.min(100, compositeScore));

    // Determine Risk Level from dynamic thresholds & active threat floors
    let riskLevel = "LOW";
    if (
      threatFloor >= 85 ||
      isWatchlistHit ||
      hasMultipleChecksumFailures ||
      isCompoundFraud ||
      compositeScore > thresholds.high
    ) {
      riskLevel = "CRITICAL";
    } else if (
      threatFloor >= 65 ||
      compositeScore > thresholds.medium ||
      isFaceMismatch ||
      tamperingScore >= 60 ||
      hasChecksumFail ||
      syntheticScore >= 70 ||
      compositeScore >= 60
    ) {
      riskLevel = "HIGH";
    } else if (
      threatFloor >= 50 ||
      compositeScore > thresholds.low ||
      isExpired ||
      signals.validation?.issues?.length > 0 ||
      syntheticScore >= 35
    ) {
      riskLevel = "MEDIUM";
    }

    // Structured Signal Evidence object
    const signalEvidence = {
      ocr: {
        status:
          ocrStatus === "FAILED_NO_FILE" || ocrStatus === "FAILED_PROCESSING_ERROR"
            ? "UNAVAILABLE"
            : ocrStatus === "LOW_CONFIDENCE"
            ? "UNCERTAIN"
            : ocrFields >= 3
            ? "PASS"
            : "PARTIAL",
        confidence: ocrConf,
        fieldsDetected: ocrFields,
      },
      validation: {
        status: isExpired || hasHighIssue || hasChecksumFail ? "FAIL" : signals.validation?.issues?.length > 0 ? "UNCERTAIN" : "PASS",
        anomalies: signals.validation?.issues || [],
        numericScore: valScore,
        hasChecksumFail,
        hasMultipleChecksumFailures,
        checksumDetails: signals.validation?.checksumDetails || [],
      },
      tampering: {
        status: tamperingScore >= 60 ? "HIGH" : tamperingScore >= 30 ? "MODERATE" : "LOW",
        score: tamperingScore,
        indicators: signals.tampering?.indicators || [],
      },
      synthetic: {
        status: signals.synthetic?.suspicionLevel || "LOW_SUSPICION",
        score: syntheticScore,
        indicators: signals.synthetic?.indicators || [],
      },
      face: {
        status:
          !isFaceProvided || faceStatus === "NOT PROVIDED"
            ? "NOT_PROVIDED"
            : isFaceMismatch
            ? "MISMATCH"
            : faceSim >= 80
            ? "MATCH"
            : "UNCERTAIN",
        similarity: faceSim ?? null,
        isProvided: Boolean(isFaceProvided),
      },
      watchlist: {
        status: isWatchlistHit ? "ALERT" : "CLEAR",
        match: isWatchlistHit,
        record: signals.watchlist?.matches?.[0] || null,
      },
    };

    return {
      riskScore: compositeScore,
      riskLevel,
      baseScore,
      threatFloor,
      threatRulesApplied,
      signalEvidence,
      signalContributions: {
        ocr: { score: Math.round(ocrConf * 100), penalty: ocrPenalty, weight: weights.ocr, weightedPoints: ocrPoints },
        validation: { score: valScore, penalty: valPenalty, weight: weights.validation, weightedPoints: valPoints },
        tampering: { score: tamperingScore, penalty: tamperingPenalty, weight: weights.tampering, weightedPoints: tamperingPoints },
        synthetic: { score: syntheticScore, penalty: syntheticPenalty, weight: weights.synthetic, weightedPoints: syntheticPoints },
        face: { score: faceSim, isProvided: isFaceProvided, penalty: facePenalty, weight: weights.face, weightedPoints: facePoints },
        watchlist: { matched: isWatchlistHit, penalty: watchlistPenalty, weight: weights.watchlist, weightedPoints: watchlistPoints },
      },
      signalScores: {
        ocrRisk: ocrPenalty,
        validationRisk: valPenalty,
        tamperingRisk: tamperingPenalty,
        syntheticRisk: syntheticPenalty,
        faceRisk: facePenalty,
        watchlistRisk: watchlistPenalty,
      },
      weights,
    };
  }
}
