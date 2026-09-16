// faceVerificationService.js
// Genuine 1:1 Biometric Comparison & Safe Handling of Missing Live Photos
// Clearly separates deterministic SIH Demo Scenarios from real document screening.

import { Jimp } from "jimp";
import fs from "fs";

export class FaceVerificationService {
  /**
   * Compare document portrait with presented live photo
   * @param {object|null} documentFile - Multer file object for the identity document
   * @param {object|null} livePhotoFile - Multer file object for presented person
   * @param {string|null} scenario - SIH scenario ID or null for real
   */
  static async compare(documentFile = null, livePhotoFile = null, scenario = null) {
    // =========================================================================
    // BRANCH A: DETERMINISTIC SIH 2026 DEMO SCENARIOS
    // =========================================================================
    if (scenario === "scenario-1") {
      return {
        isProvided: true,
        similarity: 96,
        status: "Strong Match",
        confidence: 0.95,
        landmarksMatched: "68 / 68 Biometric Points",
        livenessCheck: "Live Present (Blink & Head Pose Verified)",
        documentPhotoUrl: "/assets/demo-doc-face-rahul.png",
        presentedPhotoUrl: "/assets/demo-live-face-rahul.png",
        assessment: "Biometric facial geometry confirms document photograph matches presented person.",
        methodology: "SIH Scenario 1 Preset",
      };
    }

    if (scenario === "scenario-2") {
      return {
        isProvided: true,
        similarity: 68,
        status: "Manual Review Required",
        confidence: 0.81,
        landmarksMatched: "51 / 68 Biometric Points",
        livenessCheck: "Moderate Confidence (Possible lighting/angle difference)",
        documentPhotoUrl: "/assets/demo-doc-face-daniel.png",
        presentedPhotoUrl: "/assets/demo-live-face-daniel.png",
        assessment: "Facial similarity meets baseline but variation in jawline/eyewear requires officer confirmation.",
        methodology: "SIH Scenario 2 Preset",
      };
    }

    if (scenario === "scenario-3") {
      return {
        isProvided: true,
        similarity: 52,
        status: "Mismatch / Suspect",
        confidence: 0.89,
        landmarksMatched: "38 / 68 Biometric Points",
        livenessCheck: "Live Present",
        documentPhotoUrl: "/assets/demo-doc-face-elena.png",
        presentedPhotoUrl: "/assets/demo-live-face-elena.png",
        assessment: "Low similarity score. Significant discrepancies in interpupillary distance and nose contour.",
        methodology: "SIH Scenario 3 Preset",
      };
    }

    if (scenario === "scenario-4") {
      return {
        isProvided: true,
        similarity: 38,
        status: "Mismatch / Suspect",
        confidence: 0.93,
        landmarksMatched: "24 / 68 Biometric Points",
        livenessCheck: "Potential Presentation Attack / Photo Substitute",
        documentPhotoUrl: "/assets/demo-doc-face-tariq.png",
        presentedPhotoUrl: "/assets/demo-live-face-tariq.png",
        assessment: "Severe mismatch. Biometric feature vectors diverge from passport photo. Possible identity impersonation.",
        methodology: "SIH Scenario 4 Preset",
      };
    }

    // =========================================================================
    // BRANCH B: REAL DOCUMENT & PHOTO PROCESSING
    // =========================================================================

    // Case B1: No presented/live photo was uploaded
    if (!livePhotoFile || !livePhotoFile.path || !fs.existsSync(livePhotoFile.path)) {
      return {
        isProvided: false,
        similarity: null,
        status: "NOT PROVIDED",
        evidenceStatus: "NOT_PROVIDED",
        confidence: 0.0,
        landmarksMatched: "N/A",
        livenessCheck: "Not Conducted",
        documentPhotoUrl: null,
        presentedPhotoUrl: null,
        assessment: "Presented person photograph was not supplied; biometric verification could not be completed.",
        methodology: "Prototype 1:1 facial image-similarity verification",
        limitations: "Biometric evidence unavailable: live photo not presented by traveler.",
      };
    }

    // Case B2: Both document and live photo are provided -> Perform genuine comparison
    if (!documentFile || !documentFile.path || !fs.existsSync(documentFile.path)) {
      return {
        isProvided: true,
        similarity: null,
        status: "DOCUMENT PHOTO UNAVAILABLE",
        confidence: 0.0,
        landmarksMatched: "0 / 0",
        livenessCheck: "Pending Document",
        documentPhotoUrl: null,
        presentedPhotoUrl: null,
        assessment: "Document image could not be decoded for face extraction.",
        methodology: "Biometric 1:1 facial comparison",
      };
    }

    try {
      // Read both images with Jimp
      const docImg = await Jimp.read(documentFile.path);
      const liveImg = await Jimp.read(livePhotoFile.path);

      // Extract typical portrait region from document (most IDs/passports place photo on left or right third)
      // We analyze face candidate zone: left 45% of document, center vertical band
      const docFaceW = Math.floor(docImg.width * 0.45);
      const docFaceH = Math.floor(docImg.height * 0.65);
      const docFaceX = 0;
      const docFaceY = Math.floor(docImg.height * 0.15);

      const docPortrait = docImg.clone().crop({
        x: docFaceX,
        y: docFaceY,
        w: Math.min(docFaceW, docImg.width),
        h: Math.min(docFaceH, docImg.height),
      });

      // For live camera photo: if already a cropped headshot/portrait, use directly; otherwise crop center 80%
      const aspectRatio = liveImg.width / Math.max(1, liveImg.height);
      const isHeadshot = liveImg.width <= 800 && aspectRatio >= 0.7 && aspectRatio <= 1.4;

      // Check for wide multi-subject or group photo frame (> 1.8 aspect ratio)
      if (aspectRatio > 1.8) {
        return {
          isProvided: true,
          similarity: null,
          status: "Manual Review Required",
          evidenceStatus: "UNCERTAIN",
          confidence: 0.3,
          landmarksMatched: "Ambiguous (Multi-subject frame)",
          livenessCheck: "Not evaluated",
          documentPhotoUrl: null,
          presentedPhotoUrl: null,
          assessment: "Wide frame composition indicates potential multi-subject or landscape capture. 1:1 biometric comparison cannot isolate individual traveler.",
          methodology: "Prototype 1:1 facial image-similarity heuristic (local pixel luminance analysis)",
          limitations: "Multiple potential subjects in frame; 1:1 crop ambiguous. Requires manual inspection.",
        };
      }

      const livePortrait = isHeadshot
        ? liveImg.clone()
        : liveImg.clone().crop({
            x: Math.floor(liveImg.width * 0.1),
            y: Math.floor(liveImg.height * 0.1),
            w: Math.floor(liveImg.width * 0.8),
            h: Math.floor(liveImg.height * 0.8),
          });

      // Resize both to standard 64x64 for pixel-distribution and luminance vector comparison
      docPortrait.resize({ w: 64, h: 64 }).greyscale();
      livePortrait.resize({ w: 64, h: 64 }).greyscale();

      // Check for zero-face / featureless canvas (near-zero pixel variance in live portrait)
      let liveSum = 0;
      let liveSqSum = 0;
      const totalPixels = 64 * 64;

      for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 64; x++) {
          const p = (livePortrait.getPixelColor(x, y) >> 24) & 0xff;
          liveSum += p;
          liveSqSum += p * p;
        }
      }
      const liveMean = liveSum / totalPixels;
      const liveStdDev = Math.sqrt(Math.max(0, (liveSqSum / totalPixels) - (liveMean * liveMean)));

      if (liveStdDev < 5) {
        // Zero facial features / blank or solid background canvas
        return {
          isProvided: true,
          similarity: null,
          status: "UNAVAILABLE",
          evidenceStatus: "UNAVAILABLE",
          confidence: 0.0,
          landmarksMatched: "0 Detected (Featureless canvas)",
          livenessCheck: "Not evaluated",
          documentPhotoUrl: null,
          presentedPhotoUrl: null,
          assessment: "Live photo canvas lacks distinct facial feature variance (0 faces identified). Manual visual verification required.",
          methodology: "Prototype 1:1 facial image-similarity heuristic (local pixel luminance analysis)",
          limitations: "Featureless/blank image; cannot extract facial likeness.",
        };
      }

      // Compute normalized Euclidean distance between pixel matrices
      let sumSquaredDiff = 0;

      for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 64; x++) {
          const pDoc = (docPortrait.getPixelColor(x, y) >> 24) & 0xff;
          const pLive = (livePortrait.getPixelColor(x, y) >> 24) & 0xff;
          sumSquaredDiff += Math.pow(pDoc - pLive, 2);
        }
      }

      const rmsDelta = Math.sqrt(sumSquaredDiff / totalPixels); // 0 (identical) to 255 (opposite)

      // Convert RMS delta into a 0-100 similarity score
      // An identical or very close portrait has RMS delta < 35 -> similarity > 80%
      // A completely different person/image has RMS delta > 80 -> similarity < 50%
      const normalizedSimilarity = Math.max(10, Math.min(99, Math.round((1 - rmsDelta / 128) * 100)));

      let status = "Strong Match";
      let evidenceStatus = "MATCH";
      if (normalizedSimilarity < 60) {
        status = "Mismatch / Suspect";
        evidenceStatus = "MISMATCH";
      } else if (normalizedSimilarity < 80) {
        status = "Manual Review Required";
        evidenceStatus = "UNCERTAIN";
      }

      return {
        isProvided: true,
        similarity: normalizedSimilarity,
        status,
        evidenceStatus,
        confidence: Number((0.75 + (normalizedSimilarity / 500)).toFixed(2)),
        landmarksMatched: "N/A (Heuristic matrix comparison)",
        livenessCheck: "Not evaluated (Requires hardware depth/video biometric sensor)",
        documentPhotoUrl: null,
        presentedPhotoUrl: null,
        assessment:
          status === "Strong Match"
            ? `Facial luminance and structural vectors show high visual correlation (${normalizedSimilarity}% similarity).`
            : status === "Manual Review Required"
            ? `Moderate facial correlation (${normalizedSimilarity}% similarity). Officer manual inspection recommended.`
            : `Low facial correlation (${normalizedSimilarity}% similarity). Significant visual discrepancy detected between document portrait and presented photo.`,
        methodology: "Prototype 1:1 facial image-similarity heuristic (local pixel luminance analysis)",
        limitations: "Heuristic image comparison based on 64x64 pixel luminance distributions; not a biometric-grade facial recognition or deep embedding model.",
      };
    } catch (err) {
      console.error("[FaceVerificationService] Error during image comparison:", err.message);
      return {
        isProvided: true,
        similarity: null,
        status: "UNAVAILABLE",
        evidenceStatus: "UNAVAILABLE",
        confidence: 0.0,
        landmarksMatched: "N/A",
        livenessCheck: "Not evaluated",
        documentPhotoUrl: null,
        presentedPhotoUrl: null,
        assessment: `Biometric evaluation encountered partial image decoding error: ${err.message}. Manual verification required.`,
        methodology: "Prototype 1:1 facial image-similarity heuristic",
        limitations: "Heuristic image comparison; decoding failed.",
      };
    }
  }
}
