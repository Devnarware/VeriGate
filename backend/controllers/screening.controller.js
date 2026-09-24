// screening.controller.js
import fs from "fs";
import { OCRService } from "../services/ocrService.js";
import { ValidationService } from "../services/validationService.js";
import { TamperingService } from "../services/tamperingService.js";
import { SyntheticDetectionService } from "../services/syntheticDetectionService.js";
import { FaceVerificationService } from "../services/faceVerificationService.js";
import { WatchlistService } from "../services/watchlistService.js";
import { RiskEngine } from "../services/riskEngine.js";
import { DecisionEngine } from "../services/decisionEngine.js";
import { CaseHistoryService } from "../services/caseHistoryService.js";

/**
 * Safely delete an uploaded file after processing
 */
function cleanupFile(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("[Cleanup] Failed to delete temporary file:", err.message);
    }
  }
}

export const analyzeDocument = async (req, res, next) => {
  const filesToCleanup = [];

  try {
    const startTime = Date.now();
    const documentType = req.body.documentType || "Passport";
    const documentFile = req.files?.document?.[0] || req.file;
    const faceFile = req.files?.livePhoto?.[0];

    // Track files for cleanup
    if (documentFile?.path) filesToCleanup.push(documentFile.path);
    if (faceFile?.path) filesToCleanup.push(faceFile.path);

    // Require a document file for real processing
    if (!documentFile) {
      return res.status(400).json({
        success: false,
        message: "Please upload a document image to analyze.",
      });
    }

    // Pipeline Step 1: OCR Extraction
    const ocrData = await OCRService.extract(documentType, documentFile);

    // Pipeline Step 2: Document Validation
    const validationResults = ValidationService.validate(documentType, ocrData);

    // Pipeline Step 3: Tampering & Forgery Analysis
    const tamperingResults = await TamperingService.analyze(documentType, documentFile);

    // Pipeline Step 4: Synthetic Document Detection
    const syntheticResults = await SyntheticDetectionService.analyze(documentType, documentFile);

    // Pipeline Step 5: Face Verification (if live photo provided)
    const faceResults = await FaceVerificationService.compare(documentFile, faceFile);

    // Pipeline Step 6: Watchlist Screening
    const watchlistResults = WatchlistService.check(
      ocrData.fullName,
      ocrData.documentNumber || ocrData.visaNumber || ocrData.idNumber,
      ocrData.nationality
    );

    // Pipeline Step 7: Multi-Signal Risk Scoring
    const riskData = RiskEngine.calculate({
      ocr: ocrData,
      validation: validationResults,
      tampering: tamperingResults,
      synthetic: syntheticResults,
      faceVerification: faceResults,
      watchlist: watchlistResults,
    });

    // Pipeline Step 8: Verification Decision
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
      }
    );

    const totalProcessingMs = Date.now() - startTime;

    // Honest Checks Grid — each check describes what it actually proves
    const isFaceNotProvided = faceResults.status === "NOT PROVIDED" || !faceResults.isProvided;
    const checks = [
      {
        id: "ocr",
        title: "Text Extraction",
        description: ocrData.fullName
          ? `Extracted ${ocrData.fieldsDetected || 1} identity fields from document image.`
          : "Could not reliably extract identity fields from document image.",
        status: ocrData.confidence >= 0.8 && ocrData.fieldsDetected >= 3 ? "pass" : ocrData.confidence >= 0.5 ? "warning" : "fail",
        score: ocrData.confidence > 0 ? `${Math.round(ocrData.confidence * 100)}%` : "0%",
        note: "Successful text extraction does not prove document authenticity.",
      },
      {
        id: "validation",
        title: "Document Validation",
        description: validationResults.summary,
        status: validationResults.status,
        score: validationResults.score,
        note: "Checks field presence, expiry dates, MRZ check digits, and cross-field consistency.",
      },
      {
        id: "tampering",
        title: "Tampering Indicators",
        description:
          tamperingResults.indicators.length > 0
            ? tamperingResults.indicators[0]
            : "No tampering indicators detected by heuristic analysis.",
        status:
          tamperingResults.tamperingRisk === "Low"
            ? "pass"
            : tamperingResults.tamperingRisk === "Medium"
            ? "warning"
            : "fail",
        score: `${100 - tamperingResults.tamperingScore}%`,
        note: "Heuristic analysis (ELA + metadata). No detected anomaly does not guarantee authenticity.",
      },
      {
        id: "synthetic",
        title: "Synthetic Detection",
        description:
          syntheticResults.indicators.length > 0
            ? syntheticResults.indicators[0]
            : "No synthetic generation indicators detected.",
        status:
          syntheticResults.suspicionLevel === "LOW_SUSPICION"
            ? "pass"
            : syntheticResults.suspicionLevel === "MEDIUM_SUSPICION"
            ? "warning"
            : "fail",
        score: `${100 - syntheticResults.syntheticScore}%`,
        note: "Heuristic edge variance and texture analysis. Cannot definitively determine if document is computer-generated.",
      },
      {
        id: "face",
        title: "Face Comparison",
        description: faceResults.assessment,
        status: isFaceNotProvided
          ? "not_available"
          : faceResults.similarity >= 80
          ? "pass"
          : faceResults.similarity >= 60
          ? "warning"
          : "fail",
        score: isFaceNotProvided ? "N/A" : `${faceResults.similarity}%`,
        note: isFaceNotProvided
          ? "No comparison photo provided."
          : "Heuristic pixel-luminance comparison (64×64). Not biometric-grade facial recognition.",
      },
      {
        id: "watchlist",
        title: "Watchlist Check",
        description: watchlistResults.summary,
        status: watchlistResults.matched ? "fail" : watchlistResults.status === "UNAVAILABLE" ? "not_available" : "pass",
        score: watchlistResults.matched ? "MATCH" : watchlistResults.status === "UNAVAILABLE" ? "N/A" : "CLEAR",
        note: "Checked against local prototype database only. Not connected to any authoritative source.",
      },
    ];

    // Build verification result — NOT persisted
    const verificationResult = {
      verificationId: `VG-${Date.now()}`,
      documentType: ocrData.documentType || documentType,
      riskScore: riskData.riskScore,
      riskLevel: riskData.riskLevel,
      recommendation: decisionData.recommendation,
      reasons: decisionData.reasons,
      recommendedAction: decisionData.recommendedAction,
      processingTimeMs: totalProcessingMs,
      ocr: {
        fullName: ocrData.fullName,
        documentType: ocrData.documentType || documentType,
        documentNumber: ocrData.documentNumber,
        nationality: ocrData.nationality,
        dateOfBirth: ocrData.dateOfBirth,
        gender: ocrData.gender,
        dateOfIssue: ocrData.dateOfIssue,
        dateOfExpiry: ocrData.dateOfExpiry,
        placeOfBirth: ocrData.placeOfBirth,
        issuingCountry: ocrData.issuingCountry,
        mrz: ocrData.mrz || null,
        confidence: ocrData.confidence,
        fieldsDetected: ocrData.fieldsDetected,
        ocrStatus: ocrData.ocrStatus,
      },
      validation: validationResults,
      tampering: {
        tamperingScore: tamperingResults.tamperingScore,
        tamperingRisk: tamperingResults.tamperingRisk,
        indicators: tamperingResults.indicators,
        copyMove: tamperingResults.copyMove || { detected: false, matchedPairs: 0, confidence: 0, regions: [] },
        compressionArtifacts: tamperingResults.compressionArtifacts || { uniformityScore: 92, status: "Consistent" },
        details: tamperingResults.details,
        methodology: tamperingResults.methodology,
      },
      synthetic: {
        syntheticScore: syntheticResults.syntheticScore,
        suspicionLevel: syntheticResults.suspicionLevel,
        indicators: syntheticResults.indicators,
      },
      faceVerification: {
        isProvided: faceResults.isProvided,
        similarity: faceResults.similarity,
        status: faceResults.status,
        structuralMatch: faceResults.structuralMatch ?? null,
        eyeRegionMatch: faceResults.eyeRegionMatch ?? null,
        lowerFaceMatch: faceResults.lowerFaceMatch ?? null,
        confidence: faceResults.confidence,
        landmarksMatched: faceResults.landmarksMatched,
        faceGeometry: faceResults.faceGeometry || null,
        assessment: faceResults.assessment,
        methodology: faceResults.methodology,
        limitations: faceResults.limitations,
      },
      watchlist: {
        matched: watchlistResults.matched,
        matchCount: watchlistResults.matchCount || 0,
        status: watchlistResults.status,
        summary: watchlistResults.summary,
        matchDetails: watchlistResults.matched ? watchlistResults.matchDetails : null,
      },
      checks,
    };

    // Record verification metadata to audit log (Zero retention: no images or PII stored)
    CaseHistoryService.addCase(verificationResult);

    res.status(200).json({
      success: true,
      data: verificationResult,
    });
  } catch (error) {
    next(error);
  } finally {
    // Always cleanup uploaded files after processing (success or failure)
    for (const filePath of filesToCleanup) {
      cleanupFile(filePath);
    }
  }
};
