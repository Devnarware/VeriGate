// screening.controller.js
import { db } from "../config/db.js";
import { OCRService } from "../services/ocrService.js";
import { ValidationService } from "../services/validationService.js";
import { TamperingService } from "../services/tamperingService.js";
import { SyntheticDetectionService } from "../services/syntheticDetectionService.js";
import { FaceVerificationService } from "../services/faceVerificationService.js";
import { WatchlistService } from "../services/watchlistService.js";
import { RiskEngine } from "../services/riskEngine.js";
import { DecisionEngine } from "../services/decisionEngine.js";
import { AuditService } from "../services/auditService.js";

export const analyzeDocument = async (req, res, next) => {
  try {
    const startTime = Date.now();
    const documentType = req.body.documentType || "Passport";
    const scenario = req.body.scenario || null;
    const documentFile = req.files?.document?.[0] || req.file;
    const faceFile = req.files?.livePhoto?.[0];

    // Pipeline Step 1 & 2: Preprocessing & OCR Extraction (Async Tesseract / MRZ)
    const t0 = Date.now();
    const ocrData = await OCRService.extract(documentType, documentFile, scenario);
    const ocrMs = Date.now() - t0;

    // Pipeline Step 3: Document Validation (Rules against extracted attributes)
    const t1 = Date.now();
    const validationResults = ValidationService.validate(documentType, ocrData, scenario);
    const validationMs = Date.now() - t1;

    // Pipeline Step 4: Tampering & Forgery Analysis (Async Image Forensics / ELA)
    const t2 = Date.now();
    const tamperingResults = await TamperingService.analyze(documentType, documentFile, scenario);
    const tamperingMs = Date.now() - t2;

    // Pipeline Step 5: Synthetic Document Detection (Laplacian Edge Variance & Texture Uniformity)
    const t3 = Date.now();
    const syntheticResults = await SyntheticDetectionService.analyze(documentType, documentFile, scenario);
    const syntheticMs = Date.now() - t3;

    // Pipeline Step 6: Face Verification (Async 1:1 Biometric Comparison)
    const t4 = Date.now();
    const faceResults = await FaceVerificationService.compare(documentFile, faceFile, scenario);
    const faceMs = Date.now() - t4;

    // Pipeline Step 7: Watchlist Screening (Against actual extracted identity attributes)
    const t5 = Date.now();
    const watchlistResults = WatchlistService.check(
      ocrData.fullName,
      ocrData.documentNumber || ocrData.visaNumber || ocrData.idNumber,
      ocrData.nationality,
      scenario
    );
    const watchlistMs = Date.now() - t5;

    // Pipeline Step 8: Multi-Signal Dynamic Risk Scoring with Threat Floors
    const riskData = RiskEngine.calculate(
      {
        ocr: ocrData,
        validation: validationResults,
        tampering: tamperingResults,
        synthetic: syntheticResults,
        faceVerification: faceResults,
        watchlist: watchlistResults,
      },
      scenario
    );

    // Pipeline Step 9: Verification Decision Engine (Explainable Synthesis)
    const decisionData = DecisionEngine.evaluate(
      riskData.riskScore,
      riskData.riskLevel,
      {
        ocr: ocrData,
        validation: validationResults,
        tampering: tamperingResults,
        synthetic: syntheticResults,
        faceVerification: faceResults,
        watchlist: watchlistResults,
      },
      scenario
    );
    const totalProcessingMs = Date.now() - startTime;

    // Standardized Checks Grid for Frontend Presentation
    const isFaceNotProvided = faceResults.status === "NOT PROVIDED" || !faceResults.isProvided;
    const checks = [
      {
        id: "ocr",
        title: "OCR Extraction",
        description: ocrData.fullName
          ? `Extracted ${ocrData.fieldsDetected || 1} key identity attributes (${ocrData.documentTypeSource || "Verified"}).`
          : "Could not reliably parse identity fields from document.",
        status: ocrData.confidence >= 0.8 && ocrData.fieldsDetected >= 3 ? "pass" : ocrData.confidence >= 0.5 ? "warning" : "fail",
        score: ocrData.confidence > 0 ? `${Math.round(ocrData.confidence * 100)}%` : "0%",
      },
      {
        id: "validation",
        title: "Document Validation",
        description: validationResults.summary,
        status: validationResults.status,
        score: validationResults.score,
      },
      {
        id: "tampering",
        title: "Tampering Forensics",
        description:
          tamperingResults.indicators.length > 0
            ? tamperingResults.indicators[0]
            : "No visual manipulation or metadata anomalies detected.",
        status:
          tamperingResults.tamperingRisk === "Low"
            ? "pass"
            : tamperingResults.tamperingRisk === "Medium"
            ? "warning"
            : "fail",
        score: `${100 - tamperingResults.tamperingScore}%`,
      },
      {
        id: "synthetic",
        title: "Synthetic Detection",
        description:
          syntheticResults.indicators.length > 0
            ? syntheticResults.indicators[0]
            : "Substrate and edge variance consistent with authentic physical credential.",
        status:
          syntheticResults.suspicionLevel === "LOW_SUSPICION"
            ? "pass"
            : syntheticResults.suspicionLevel === "MEDIUM_SUSPICION"
            ? "warning"
            : "fail",
        score: `${100 - syntheticResults.syntheticScore}%`,
      },
      {
        id: "face",
        title: "Face Verification",
        description: faceResults.assessment,
        status: isFaceNotProvided
          ? "warning"
          : faceResults.similarity >= 80
          ? "pass"
          : faceResults.similarity >= 60
          ? "warning"
          : "fail",
        score: isFaceNotProvided ? "UNVERIFIED" : `${faceResults.similarity}%`,
      },
      {
        id: "watchlist",
        title: "Watchlist Check",
        description: watchlistResults.summary,
        status: watchlistResults.matched ? "fail" : "pass",
        score: watchlistResults.matched ? "ALERT" : "CLEAR",
      },
    ];

    // Verification ID
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const verificationId = `VG-2026-${randomSuffix}`;

    const verificationRecord = {
      id: verificationId,
      verificationId,
      screeningId: verificationId,
      personName: ocrData.fullName || "Unextracted Subject",
      documentType: ocrData.documentType || documentType,
      documentNumber: ocrData.documentNumber || ocrData.visaNumber || ocrData.idNumber || "N/A",
      nationality: ocrData.nationality || "N/A",
      riskScore: riskData.riskScore,
      riskLevel: riskData.riskLevel,
      risk: {
        score: riskData.riskScore,
        level: riskData.riskLevel,
        baseScore: riskData.baseScore ?? riskData.riskScore,
        threatFloor: riskData.threatFloor ?? 0,
        threatRulesApplied: riskData.threatRulesApplied ?? [],
      },
      recommendation: decisionData.recommendation,
      reasons: decisionData.reasons,
      recommendedAction: decisionData.recommendedAction,
      decision: {
        decision: decisionData.recommendation,
        action: decisionData.recommendedAction,
        reasons: decisionData.reasons,
      },
      status: riskData.riskLevel === "LOW" ? "Verified" : riskData.riskLevel === "MEDIUM" ? "Review" : "Flagged",
      timestamp: new Date().toISOString(),
      isDemoScenario: Boolean(scenario),
      analysisMode: scenario ? "DEMO_SCENARIO" : "REAL_UPLOAD",
      processingTimes: {
        ocrMs,
        validationMs,
        tamperingMs,
        syntheticMs,
        faceMs,
        watchlistMs,
        totalMs: totalProcessingMs,
      },
      ocr: ocrData,
      validation: validationResults,
      tampering: tamperingResults,
      synthetic: syntheticResults,
      faceVerification: faceResults,
      watchlist: watchlistResults,
      signalContributions: riskData.signalContributions || null,
      signalEvidence: riskData.signalEvidence || null,
      checks,
    };

    // Save to DataStore
    db.insert("screenings", verificationRecord);

    // Auto-generate Alert if High or Critical Risk
    if (riskData.riskLevel === "HIGH" || riskData.riskLevel === "CRITICAL" || watchlistResults.matched) {
      const alertId = `ALT-${Math.floor(100 + Math.random() * 900)}`;
      db.insert("alerts", {
        id: alertId,
        severity: riskData.riskLevel === "CRITICAL" ? "Critical" : "High",
        type: watchlistResults.matched ? "Watchlist Match" : "Document Tampering",
        title: watchlistResults.matched
          ? `Watchlist match: ${ocrData.fullName}`
          : `High risk document detected: ${ocrData.fullName}`,
        description: decisionData.reasons[0] || "High risk identity screening anomaly.",
        verificationId,
        time: "Just now",
        timestamp: new Date().toISOString(),
        status: "New",
      });

      AuditService.log({
        officer: "Alex Singh",
        action: "Alert Generated",
        entity: "Alert",
        entityId: alertId,
        result: `${riskData.riskLevel} Risk Triggered`,
      });
    }

    // Audit Log
    AuditService.log({
      officer: "Alex Singh",
      action: "Verification Completed",
      entity: "Screening",
      entityId: verificationId,
      result: `Risk Score: ${riskData.riskScore}/100 (${decisionData.recommendation})`,
    });

    res.status(200).json({
      success: true,
      data: verificationRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const getScreeningHistory = async (req, res, next) => {
  try {
    const { search, risk, documentType, limit = 50 } = req.query;
    let list = db.get("screenings");

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (item) =>
          item.personName?.toLowerCase().includes(q) ||
          item.documentNumber?.toLowerCase().includes(q) ||
          item.verificationId?.toLowerCase().includes(q)
      );
    }

    if (risk && risk !== "ALL") {
      list = list.filter((item) => item.riskLevel?.toUpperCase() === risk.toUpperCase());
    }

    if (documentType && documentType !== "ALL") {
      list = list.filter((item) => item.documentType?.toLowerCase() === documentType.toLowerCase());
    }

    res.status(200).json({
      success: true,
      count: list.length,
      data: list.slice(0, Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

export const getScreeningById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = db.findById("screenings", id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Screening record not found" });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const getDemoScenarios = async (req, res) => {
  res.status(200).json({
    success: true,
    data: [
      {
        id: "scenario-1",
        label: "Scenario 1: Low Risk (Clean Indian Passport)",
        description: "Valid passport, all security checks pass, 96% face match, PROCEED decision.",
        expectedScore: 18,
        expectedRisk: "LOW",
        expectedRecommendation: "PROCEED",
        documentType: "Passport",
      },
      {
        id: "scenario-2",
        label: "Scenario 2: Medium Risk (Visa Inconsistency)",
        description: "UK Business Visa, stay duration mismatch vs stamp, 68% face match, MANUAL REVIEW.",
        expectedScore: 47,
        expectedRisk: "MEDIUM",
        expectedRecommendation: "MANUAL REVIEW",
        documentType: "Visa",
      },
      {
        id: "scenario-3",
        label: "Scenario 3: High Risk (Altered Passport & Photo Manipulation)",
        description: "Ukrainian passport with altered expiry date and photo edge blending, HOLD FOR SECONDARY.",
        expectedScore: 74,
        expectedRisk: "HIGH",
        expectedRecommendation: "HOLD FOR SECONDARY VERIFICATION",
        documentType: "Passport",
      },
      {
        id: "scenario-4",
        label: "Scenario 4: Critical Risk (Interpol Watchlist Hit & Forged Substrate)",
        description: "Active Interpol Red Notice subject with physical substrate tampering, ESCALATE decision.",
        expectedScore: 92,
        expectedRisk: "CRITICAL",
        expectedRecommendation: "ESCALATE",
        documentType: "Passport",
      },
    ],
  });
};
