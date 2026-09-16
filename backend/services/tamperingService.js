// tamperingService.js
// Genuine Image-Forensic Heuristics & Error Level Analysis (ELA)
// Clearly separates deterministic SIH Demo Scenarios from real document screening.

import { Jimp } from "jimp";
import fs from "fs";

export class TamperingService {
  /**
   * Forensic analysis entry point
   * @param {string} documentType
   * @param {object} fileInfo - Multer file metadata
   * @param {string|null} scenario - SIH scenario ID or null for real
   */
  static async analyze(documentType, fileInfo = null, scenario = null) {
    // =========================================================================
    // BRANCH A: DETERMINISTIC SIH 2026 DEMO SCENARIOS
    // =========================================================================
    if (scenario === "scenario-1") {
      return {
        tamperingScore: 6,
        tamperingRisk: "Low",
        indicators: [],
        confidence: 0.96,
        details: {
          elaAnalysis: "Uniform error level compression across all blocks",
          fontConsistency: "Original security typeface preserved",
          photoBoundary: "Seamless laminate integration, no edge blur",
          stampIntegrity: "Official consular micro-lines intact",
        },
        methodology: "SIH Scenario 1 Preset",
      };
    }

    if (scenario === "scenario-2") {
      return {
        tamperingScore: 34,
        tamperingRisk: "Medium",
        indicators: [
          "Minor font weight variation detected in issuing authority field",
          "Secondary compression grid variance along visa boundary",
        ],
        confidence: 0.85,
        details: {
          elaAnalysis: "Localized slight variance in bottom right quadrant",
          fontConsistency: "Variance detected: Helvetica-Neue substituted for official OCR-B font",
          photoBoundary: "Consistent with standard issuance",
          stampIntegrity: "Border stamp shows 12% pixel misalignment",
        },
        methodology: "SIH Scenario 2 Preset",
      };
    }

    if (scenario === "scenario-3") {
      return {
        tamperingScore: 76,
        tamperingRisk: "High",
        indicators: [
          "Photo perimeter contains edge blending and clone-stamp blur artifacts",
          "Expiry date region shows inconsistent JPEG quantization table (Error Level Analysis: High)",
          "MRZ checksum mismatch indicates text manipulation in machine readable zone",
        ],
        confidence: 0.92,
        details: {
          elaAnalysis: "Pronounced high-frequency resaving traces on date of birth and expiry",
          fontConsistency: "Irregular character kerning on year digits '29' vs '20'",
          photoBoundary: "Discontinuous background micro-pattern around headshot outline",
          stampIntegrity: "Embossed state seal fails optical depth reconstruction",
        },
        methodology: "SIH Scenario 3 Preset",
      };
    }

    if (scenario === "scenario-4") {
      return {
        tamperingScore: 89,
        tamperingRisk: "Critical",
        indicators: [
          "Physical photo replacement detected: dual background color gradients in portrait box",
          "Digital text overlay identified over original passport number",
          "Security microprint pattern erased beneath document holder name",
          "Missing UV reflective security thread in optical scan",
        ],
        confidence: 0.95,
        details: {
          elaAnalysis: "Severe multi-stage image recomposition and splicing detected",
          fontConsistency: "Digital font overlay detected; non-conforming glyph widths",
          photoBoundary: "Laminate cut marks and synthetic pixel feathering around portrait",
          stampIntegrity: "Counterfeit ink signature with repeated digital stamp clone pattern",
        },
        methodology: "SIH Scenario 4 Preset",
      };
    }

    // =========================================================================
    // BRANCH B: REAL DOCUMENT IMAGE-FORENSIC HEURISTICS
    // =========================================================================
    if (!fileInfo || !fileInfo.path || !fs.existsSync(fileInfo.path)) {
      return {
        tamperingScore: 0,
        tamperingRisk: "Low",
        indicators: ["Forensic analysis unavailable: No image file provided."],
        confidence: 0.0,
        details: { status: "NO_FILE" },
        methodology: "Prototype image-forensic analysis using deterministic image heuristics.",
      };
    }

    const indicators = [];
    let detectedScore = 5; // Clean scan baseline
    let elaMean = 0;
    let elaMax = 0;
    let elaVariance = 0;
    let metadataSignatureFound = null;

    try {
      // 1. Metadata & Software Marker Inspection (Check raw buffer for editing tools)
      const rawBuffer = fs.readFileSync(fileInfo.path);

      const editingSoftwareKeywords = [
        { name: "Adobe Photoshop", weight: 35 },
        { name: "Photoshop", weight: 35 },
        { name: "GIMP", weight: 30 },
        { name: "Canva", weight: 25 },
        { name: "Paint.NET", weight: 25 },
        { name: "Inkscape", weight: 20 },
        { name: "CorelDRAW", weight: 25 },
        { name: "Photoscape", weight: 25 },
      ];

      for (const sw of editingSoftwareKeywords) {
        if (rawBuffer.includes(Buffer.from(sw.name))) {
          metadataSignatureFound = sw.name;
          indicators.push(`Image editing software signature detected: File metadata indicates processing with ${sw.name}. Potential image manipulation indicator; additional verification recommended.`);
          detectedScore += sw.weight;
          break;
        }
      }

      // 2. Load with Jimp for pixel-level Error Level Analysis (ELA)
      let originalImg = null;
      try {
        originalImg = await Jimp.read(fileInfo.path);
      } catch (readErr) {
        // If file is PDF or non-image, note in indicators
        indicators.push(`Image decoding limited: ${readErr.message}`);
      }

      if (originalImg) {
        const width = originalImg.width;
        const height = originalImg.height;

        // Resolution heuristics
        if (width < 350 || height < 350) {
          indicators.push(`Resolution anomaly: Substandard image dimensions (${width}x${height}px) reduce forensic certainty.`);
          detectedScore += 12;
        }

        // Recompress to JPEG at 90% quality to compute ELA difference
        const recompressedBuffer = await originalImg.getBuffer("image/jpeg", { quality: 90 });
        const recompressedImg = await Jimp.read(recompressedBuffer);

        // Sample grid of pixels (downsample for fast evaluation)
        const stepX = Math.max(1, Math.floor(width / 32));
        const stepY = Math.max(1, Math.floor(height / 32));

        const blockDeltas = [];
        let totalDelta = 0;
        let sampleCount = 0;

        for (let y = 0; y < height; y += stepY) {
          let rowDelta = 0;
          let rowSamples = 0;
          for (let x = 0; x < width; x += stepX) {
            const c1 = originalImg.getPixelColor(x, y);
            const c2 = recompressedImg.getPixelColor(x, y);

            const r1 = (c1 >> 24) & 0xff;
            const g1 = (c1 >> 16) & 0xff;
            const b1 = (c1 >> 8) & 0xff;

            const r2 = (c2 >> 24) & 0xff;
            const g2 = (c2 >> 16) & 0xff;
            const b2 = (c2 >> 8) & 0xff;

            const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
            rowDelta += diff;
            rowSamples++;
            totalDelta += diff;
            sampleCount++;

            if (diff > elaMax) {
              elaMax = diff;
            }
          }
          blockDeltas.push(rowDelta / Math.max(1, rowSamples));
        }

        elaMean = sampleCount > 0 ? totalDelta / sampleCount : 0;

        // Compute variance of block deltas
        const variance =
          blockDeltas.reduce((acc, val) => acc + Math.pow(val - elaMean, 2), 0) /
          Math.max(1, blockDeltas.length);
        elaVariance = Math.sqrt(variance);

        // Evaluate ELA heuristics
        // High block variance signifies non-uniform compression (localized splicing or overlay)
        if (elaVariance > 18) {
          indicators.push(`Error Level Analysis: High block compression variance (${elaVariance.toFixed(1)}) indicates possible localized digital modification.`);
          detectedScore += 30;
        } else if (elaVariance > 10) {
          indicators.push(`Error Level Analysis: Moderate compression variance (${elaVariance.toFixed(1)}) detected.`);
          detectedScore += 15;
        }

        if (elaMax > 90) {
          indicators.push(`Optical discrepancy: High-frequency pixel disparity peak (${elaMax}) detected in edge regions.`);
          detectedScore += 10;
        }
      }

      // Cap tampering score between 0 and 100
      const finalScore = Math.min(99, Math.max(4, detectedScore));

      let tamperingRisk = "Low";
      let evidenceStatus = "LOW";
      if (finalScore >= 80) {
        tamperingRisk = "Critical";
        evidenceStatus = "CRITICAL";
      } else if (finalScore >= 60) {
        tamperingRisk = "High";
        evidenceStatus = "HIGH";
      } else if (finalScore >= 30) {
        tamperingRisk = "Medium";
        evidenceStatus = "MODERATE";
      }

      return {
        tamperingScore: finalScore,
        tamperingRisk,
        evidenceStatus,
        indicators,
        confidence: indicators.length > 0 && finalScore > 40 ? 0.88 : 0.94,
        details: {
          elaMean: Number(elaMean.toFixed(2)),
          elaMax,
          elaBlockVariance: Number(elaVariance.toFixed(2)),
          metadataSoftware: metadataSignatureFound || "No third-party editing signatures found",
          imageDimensions: originalImg ? `${originalImg.width}x${originalImg.height}` : "N/A",
        },
        methodology: "Prototype image-forensic analysis using deterministic image heuristics (Error Level Analysis & metadata inspection).",
      };
    } catch (err) {
      console.error("[TamperingService] Forensic analysis error:", err.message);
      return {
        tamperingScore: 15,
        tamperingRisk: "Low",
        indicators: [`Forensic scan encountered partial decoding error: ${err.message}`],
        confidence: 0.5,
        details: { error: err.message },
        methodology: "Prototype image-forensic analysis using deterministic image heuristics.",
      };
    }
  }
}
