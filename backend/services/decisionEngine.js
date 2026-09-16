// decisionEngine.js
// Explainable Verification Decision Support Engine
// Synthesizes transparent justifications and actionable officer directives from actual findings.

export class DecisionEngine {
  /**
   * Evaluate multi-signal findings into explainable decision
   * @param {number} riskScore - Composite score (0-100)
   * @param {string} riskLevel - LOW / MEDIUM / HIGH / CRITICAL
   * @param {object} signals - OCR, Validation, Tampering, Face, Watchlist
   * @param {string|null} scenario - SIH scenario ID or null for real
   */
  static evaluate(riskScore, riskLevel, signals = {}, scenario = null) {
    const reasons = [];
    let recommendation = "PROCEED";
    let recommendedAction = "Proceed with standard traveler verification.";

    // =========================================================================
    // BRANCH A: DETERMINISTIC SIH DEMO SCENARIOS
    // =========================================================================
    if (scenario === "scenario-1") {
      return {
        recommendation: "PROCEED",
        reasons: [
          "Required information extracted with high OCR confidence (98%).",
          "Document validity and chronological checks passed without warnings.",
          "No visual tampering or compression anomalies detected.",
          "Strong biometric face similarity between document and presented person (96%).",
          "No match found against security watchlist databases.",
        ],
        recommendedAction: "Allow passenger transit. No secondary inspection required.",
      };
    }

    if (scenario === "scenario-2") {
      return {
        recommendation: "MANUAL REVIEW",
        reasons: [
          "Visa validity duration (90 Days) contradicts immigration stamp limit (30 Days).",
          "Possible font or printing variance in issuing authority region (Tampering score: 34/100).",
          "Moderate facial similarity (68%) requires officer visual confirmation.",
        ],
        recommendedAction: "Inspect original document under white & UV light and verify return flight booking.",
      };
    }

    if (scenario === "scenario-3") {
      return {
        recommendation: "HOLD FOR SECONDARY VERIFICATION",
        reasons: [
          "Possible document alteration detected in expiration and photo boundaries.",
          "High tampering score (76/100): localized compression artifacts on date fields.",
          "Biometric facial similarity (52%) is below acceptable threshold.",
          "MRZ checksum mismatch indicates text manipulation.",
        ],
        recommendedAction: "Hold passenger for secondary immigration screening and forensics laboratory examination.",
      };
    }

    if (scenario === "scenario-4") {
      return {
        recommendation: "ESCALATE",
        reasons: [
          "Critical Watchlist Match: Flagged under Interpol Red Notice #A-2025-9921.",
          "Severe physical and digital tampering indicators detected on document substrate.",
          "Identity mismatch: biometric landmarks diverge significantly from document portrait (38%).",
          "Counterfeit security features and missing optical safety elements.",
        ],
        recommendedAction: "Immediate officer detention of subject and alert Border Police Commander.",
      };
    }

    // =========================================================================
    // BRANCH B: REAL DOCUMENT FINDINGS SYNTHESIS
    // =========================================================================
    const { ocr = {}, validation = {}, tampering = {}, synthetic = {}, faceVerification = {}, watchlist = {} } = signals;

    // Signal 1: Watchlist Evaluation
    if (watchlist.matched) {
      recommendation = "ESCALATE";
      reasons.push(`CRITICAL WATCHLIST HIT: Subject flagged under ${watchlist.matchDetails?.source || "Security Advisory"} (${watchlist.matchDetails?.reason || "Restricted Traveller"}).`);
      recommendedAction = "Immediately hold subject at checkpoint counter and alert supervisory Border Police Officer.";
      return { recommendation, reasons, recommendedAction };
    }

    // Signal 2: OCR Status
    if (ocr.ocrStatus === "FAILED_NO_FILE" || ocr.ocrStatus === "FAILED_PROCESSING_ERROR") {
      reasons.push("Optical Character Recognition failed to process document image.");
    } else if (ocr.ocrStatus === "LOW_CONFIDENCE") {
      reasons.push(`Low OCR extraction confidence (${Math.round((ocr.confidence || 0) * 100)}%): Key biographic fields unverified.`);
    } else if (ocr.mrz) {
      reasons.push("ICAO Doc 9303 Machine Readable Zone (MRZ) successfully identified and extracted.");
    } else if (ocr.fullName) {
      reasons.push(`Identity attributes extracted: ${ocr.fullName} (${ocr.documentNumber || "Doc No. Unextracted"}).`);
    }

    // Signal 3: Document Validation Rules
    const hasMultipleChecksumFailures = Boolean(
      validation.hasMultipleChecksumFailures ||
      validation.verifiedFailedChecksumCount >= 2 ||
      validation.failedChecksumCount >= 2 ||
      validation.issues?.filter((i) => i.rule?.includes("MRZ") && i.rule?.includes("CHECK_DIGIT_FAILED") && !i.rule?.includes("COMPOSITE")).length >= 2
    );

    if (hasMultipleChecksumFailures) {
      reasons.push("ICAO DOC 9303 INTEGRITY BREACH: Multiple MRZ check digits failed cryptographic validation. Strong indicator of identity falsification.");
    }

    if (validation.issues && validation.issues.length > 0) {
      validation.issues.forEach((issue) => {
        if (issue.rule === "DOCUMENT_EXPIRED") {
          reasons.push(`DOCUMENT EXPIRED: ${issue.message}`);
        } else if (issue.rule.includes("MRZ")) {
          if (!hasMultipleChecksumFailures || !issue.rule.includes("MULTIPLE")) {
            reasons.push(`MRZ CHECKSUM ANOMALY: ${issue.message}`);
          }
        } else if (issue.rule === "DOCUMENT_NUMBER_MISMATCH") {
          reasons.push(`DISCREPANCY: ${issue.message}`);
        } else {
          reasons.push(`VALIDATION WARNING: ${issue.message}`);
        }
      });
    } else if (validation.passed) {
      reasons.push("Document chronological rules, expiration dates, and check digits verified consistent.");
    }

    // Signal 4: Image Forensics & Tampering
    if (tampering.tamperingScore >= 60 || tampering.tamperingRisk === "High" || tampering.tamperingRisk === "Critical") {
      reasons.push(`HIGH TAMPERING RISK (${tampering.tamperingScore}/100): ${tampering.indicators?.[0] || "Potential digital alteration or photo boundary anomaly."}`);
    } else if (tampering.tamperingScore >= 30) {
      reasons.push(`MODERATE FORENSIC ANOMALY (${tampering.tamperingScore}/100): ${tampering.indicators?.[0] || "Minor compression variance across image blocks."}`);
    } else {
      reasons.push(`No significant digital tampering or compression anomalies detected (${tampering.tamperingScore || 5}/100).`);
    }

    // Signal 5: Synthetic / AI Document Detection
    if (synthetic.syntheticScore >= 70 || synthetic.suspicionLevel === "HIGH_SUSPICION") {
      reasons.push(`SYNTHETIC CREDENTIAL ANOMALY (${synthetic.syntheticScore}/100): ${synthetic.indicators?.[0] || "Spatial edge variance and texture uniformity suggest AI generation."}`);
    } else if (synthetic.syntheticScore >= 35 || synthetic.suspicionLevel === "MEDIUM_SUSPICION") {
      reasons.push(`TEMPLATE VARIANCE (${synthetic.syntheticScore}/100): ${synthetic.indicators?.[0] || "Geometric template or frequency spectrum deviation detected."}`);
    }

    // Signal 6: Biometric Face Verification
    if (faceVerification.status === "NOT PROVIDED" || !faceVerification.isProvided) {
      reasons.push("Presented person photo was not supplied; 1:1 biometric facial comparison could not be verified.");
    } else if (faceVerification.status === "Mismatch / Suspect") {
      reasons.push(`BIOMETRIC MISMATCH: Facial similarity (${faceVerification.similarity}%) falls below acceptable border threshold.`);
    } else if (faceVerification.status === "Manual Review Required") {
      reasons.push(`BIOMETRIC UNCERTAINTY: Moderate facial similarity (${faceVerification.similarity}%). Requires officer visual confirmation.`);
    } else if (faceVerification.status === "Strong Match") {
      reasons.push(`Biometric facial geometry strongly matches document portrait (${faceVerification.similarity}% similarity).`);
    }

    // Watchlist Clear
    if (!watchlist.matched) {
      reasons.push("Subject and document number clear across prototype security and immigration watchlists.");
    }

    // =========================================================================
    // RECOMMENDATION LOGIC (EXPLAINABLE SYNTHESIS & 10-TIER PRIORITY HIERARCHY)
    // =========================================================================
    const hasExpiredDoc = validation.issues?.some((i) => i.rule === "DOCUMENT_EXPIRED");
    const hasChecksumFail = Boolean(
      validation.hasVerifiedChecksumFail ||
      validation.hasChecksumFail ||
      validation.verifiedFailedChecksumCount >= 1 ||
      validation.issues?.some((i) => i.rule?.includes("MRZ") && i.rule?.includes("CHECK_DIGIT_FAILED"))
    );
    const hasChecksumUncertainty = Boolean(
      validation.hasChecksumUncertainty ||
      validation.checksumUncertaintyCount >= 1 ||
      validation.issues?.some((i) => i.rule === "MRZ_CHECK_DIGIT_UNCERTAIN" || i.rule === "MRZ_UNAVAILABLE")
    );
    const hasHighValidationIssue = validation.issues?.some((i) => i.severity === "High");
    const isFaceMismatch =
      faceVerification.status === "Mismatch / Suspect" ||
      faceVerification.evidenceStatus === "MISMATCH" ||
      (faceVerification.isProvided && typeof faceVerification.similarity === "number" && faceVerification.similarity < 60);
    const hasHighTampering = tampering.tamperingScore >= 60 || tampering.evidenceStatus === "HIGH" || tampering.evidenceStatus === "CRITICAL";
    const hasHighSynthetic = (synthetic.syntheticScore || 0) >= 70 || synthetic.suspicionLevel === "HIGH_SUSPICION";

    const isBiometricIncomplete =
      !faceVerification.isProvided ||
      faceVerification.status === "NOT PROVIDED" ||
      faceVerification.status === "UNAVAILABLE" ||
      faceVerification.status === "DOCUMENT PHOTO UNAVAILABLE" ||
      faceVerification.evidenceStatus === "NOT_PROVIDED" ||
      faceVerification.evidenceStatus === "UNAVAILABLE";

    const isCompoundFraud =
      (hasChecksumFail && isFaceMismatch) ||
      (hasChecksumFail && hasHighSynthetic) ||
      (hasMultipleChecksumFailures && (isFaceMismatch || hasHighSynthetic || hasHighTampering)) ||
      (isFaceMismatch && (hasHighSynthetic || hasHighTampering));

    // PRIORITY 1: Confirmed Watchlist / Security Match
    if (watchlist.matched) {
      recommendation = "ESCALATE";
      recommendedAction = "Immediately hold subject at checkpoint counter and alert supervisory Border Police Officer.";
    }
    // PRIORITY 2: Compound Severe Fraud (Corroborated multi-vector attack)
    else if (isCompoundFraud || riskScore >= 90) {
      recommendation = "HOLD FOR SECONDARY VERIFICATION";
      recommendedAction = "Critical multi-vector security alert. Hold subject for secondary immigration interrogation and physical forensic examination.";
    }
    // PRIORITY 3: Multiple Independent Credential-Integrity Failures
    else if (hasMultipleChecksumFailures || riskScore >= 85) {
      recommendation = "HOLD FOR SECONDARY VERIFICATION";
      recommendedAction = "Hold passenger. Document fails multiple ICAO Doc 9303 cryptographic check digit calculations. Seize credential for forensic lab examination.";
    }
    // PRIORITY 4: Biometric Face Mismatch (Potential Impersonation / Lookalike Fraud)
    // Invariant: The system MUST NEVER recommend PROCEED when a face mismatch is detected
    else if (isFaceMismatch) {
      recommendation = "HOLD FOR SECONDARY VERIFICATION";
      recommendedAction = "Hold passenger. Facial likeness does not correlate with document photograph. Verify passenger identity through secondary biometric enrollment and questioning.";
    }
    // PRIORITY 5: High-Confidence Document Tampering
    else if (hasHighTampering) {
      recommendation = "HOLD FOR SECONDARY VERIFICATION";
      recommendedAction = "Hold passenger. Document displays high forensic indicators of localized digital or physical alteration.";
    }
    // PRIORITY 6: Single Checksum Failure (Verified cryptographic mismatch)
    else if (hasChecksumFail) {
      recommendation = "HOLD FOR SECONDARY VERIFICATION";
      recommendedAction = "Hold passenger for secondary physical inspection. Machine Readable Zone check digit mismatch indicates potential character alteration.";
    }
    // PRIORITY 7: Expired Credential
    else if (hasExpiredDoc) {
      recommendation = "HOLD FOR SECONDARY VERIFICATION";
      recommendedAction = "Hold passenger. Travel credential is expired and invalid for border crossing.";
    }
    // PRIORITY 8: High Synthetic Suspicion
    else if (hasHighSynthetic) {
      recommendation = "HOLD FOR SECONDARY VERIFICATION";
      recommendedAction = "Hold passenger. Document exhibits characteristics of synthetic/AI-rendered credential. Conduct physical spectroscopy inspection.";
    }
    // PRIORITY 9: Uncertainty / Incomplete Biometric Evidence / Moderate Inconsistencies
    // Invariant: Missing live photo or unavailable signal must NEVER produce PROCEED
    else if (isBiometricIncomplete) {
      recommendation = "MANUAL REVIEW";
      if (faceVerification.status === "UNAVAILABLE") {
        recommendedAction = "Biometric evaluation unavailable due to live image decoding or capture failure. Perform manual visual verification of traveler against physical credential.";
      } else {
        recommendedAction = "Document credentials verified valid. Conduct manual visual inspection of traveler's face against credential photograph at the counter.";
      }
    } else if (
      riskScore > 30 ||
      hasChecksumUncertainty ||
      faceVerification.evidenceStatus === "UNCERTAIN" ||
      faceVerification.status === "Manual Review Required" ||
      (tampering.tamperingScore || 0) >= 30 ||
      (synthetic.syntheticScore || 0) >= 35 ||
      ocr.ocrStatus === "LOW_CONFIDENCE" ||
      ocr.ocrStatus === "PARTIAL" ||
      validation.issues?.length > 0 ||
      hasHighValidationIssue
    ) {
      recommendation = "MANUAL REVIEW";
      if (hasChecksumUncertainty) {
        recommendedAction = "MRZ check digit or format uncertain due to optical or data formatting anomalies. Perform manual counter inspection of physical document.";
      } else {
        recommendedAction = "Perform manual counter verification of traveler physical credential and biometric match.";
      }
    }
    // PRIORITY 10: Clean Verification (All checks passed + verified biometric match)
    // PROCEED is strictly gated: requires explicit biometric match (>=80%), low risk (<=30), clean validation, no tampering, no synthetic suspicion
    else if (
      (faceVerification.evidenceStatus === "MATCH" || faceVerification.status === "Strong Match") &&
      typeof faceVerification.similarity === "number" &&
      faceVerification.similarity >= 80 &&
      riskScore <= 30 &&
      validation.passed &&
      !hasChecksumFail &&
      !hasChecksumUncertainty &&
      (!validation.issues || validation.issues.length === 0) &&
      (tampering.tamperingScore || 0) < 30 &&
      (synthetic.syntheticScore || 0) < 35 &&
      (ocr.ocrStatus === "SUCCESS" || ocr.confidence >= 0.7)
    ) {
      recommendation = "PROCEED";
      recommendedAction = "Allow traveler transit. All optical, format, forensic, and biometric verification checks passed.";
    } else {
      recommendation = "MANUAL REVIEW";
      recommendedAction = "Conduct standard secondary counter inspection before clearance.";
    }

    return {
      recommendation,
      reasons,
      recommendedAction,
    };
  }
}
