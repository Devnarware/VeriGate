// syntheticDetectionService.js
// Heuristic AI-Generated & Synthetic Document Detection Engine
// Inspects edge sharpness distribution, texture uniformity, template aspect ratio, and generator metadata.

import { Jimp } from "jimp";
import fs from "fs";

export class SyntheticDetectionService {
  /**
   * Analyze document image for synthetic / AI-generation heuristics
   * @param {string} documentType - Passport, Visa, National ID, etc.
   * @param {object|null} fileInfo - Multer file object
   * @param {string|null} scenario - SIH scenario ID or null for real
   */
  static async analyze(documentType, fileInfo = null, scenario = null) {
    // Branch A: Deterministic SIH Demo Scenarios
    if (scenario === "scenario-1") {
      return {
        syntheticScore: 5,
        suspicionLevel: "LOW_SUSPICION",
        indicators: [],
        metrics: {
          edgeVariance: 42.1,
          textureUniformityScore: 18.4,
          aspectRatio: 1.42,
          aspectRatioAnomaly: false,
          aiMetadataFound: false,
        },
        methodology: "SIH Scenario 1 Preset",
        limitations: "Preset demonstration mode.",
      };
    }

    if (scenario === "scenario-2") {
      return {
        syntheticScore: 20,
        suspicionLevel: "LOW_SUSPICION",
        indicators: ["Minor background texture variation in visa stamp quadrant."],
        metrics: {
          edgeVariance: 36.8,
          textureUniformityScore: 24.1,
          aspectRatio: 1.38,
          aspectRatioAnomaly: false,
          aiMetadataFound: false,
        },
        methodology: "SIH Scenario 2 Preset",
        limitations: "Preset demonstration mode.",
      };
    }

    if (scenario === "scenario-3") {
      return {
        syntheticScore: 45,
        suspicionLevel: "MEDIUM_SUSPICION",
        indicators: ["Localized edge feathering and synthetic blending along portrait boundary."],
        metrics: {
          edgeVariance: 22.4,
          textureUniformityScore: 48.6,
          aspectRatio: 1.41,
          aspectRatioAnomaly: false,
          aiMetadataFound: false,
        },
        methodology: "SIH Scenario 3 Preset",
        limitations: "Preset demonstration mode.",
      };
    }

    if (scenario === "scenario-4") {
      return {
        syntheticScore: 82,
        suspicionLevel: "HIGH_SUSPICION",
        indicators: [
          "Non-standard substrate frequency spectrum: High-frequency grain erasure consistent with synthetic rendering.",
          "Synthetic artifact pattern detected in guilloche security background.",
        ],
        metrics: {
          edgeVariance: 11.2,
          textureUniformityScore: 81.3,
          aspectRatio: 1.42,
          aspectRatioAnomaly: false,
          aiMetadataFound: false,
        },
        methodology: "SIH Scenario 4 Preset",
        limitations: "Preset demonstration mode.",
      };
    }

    // Branch B: Real Document Heuristic Analysis
    const hasPath = fileInfo?.path && fs.existsSync(fileInfo.path);
    const hasBuffer = Buffer.isBuffer(fileInfo) || Buffer.isBuffer(fileInfo?.buffer);
    if (!hasPath && !hasBuffer) {
      return {
        syntheticScore: 0,
        suspicionLevel: "INCONCLUSIVE",
        indicators: ["Synthetic analysis unavailable: No image file provided."],
        metrics: {},
        methodology: "Local spatial gradient & edge distribution heuristics.",
        limitations: "Image buffer not available.",
      };
    }

    const indicators = [];
    let suspicionScore = 10; // Clean baseline
    let edgeVariance = 0;
    let textureUniformityScore = 0;
    let computedRatio = 1.42;
    let isRatioAnomaly = false;
    let aiMetadataFound = false;

    try {
      const rawBuffer = Buffer.isBuffer(fileInfo)
        ? fileInfo
        : fileInfo.buffer || fs.readFileSync(fileInfo.path);

      // 1. Check for AI Generator Metadata & Signatures in raw buffer
      const aiKeywords = [
        "stable-diffusion",
        "stablediffusion",
        "midjourney",
        "dall-e",
        "dalle",
        "comfyui",
        "civitai",
        "novelai",
        "invokeai",
        "automatic1111",
        "prompt:",
        "negative_prompt",
      ];

      const rawLower = rawBuffer.slice(0, Math.min(rawBuffer.length, 65536)).toString("latin1").toLowerCase();
      for (const kw of aiKeywords) {
        if (rawLower.includes(kw)) {
          aiMetadataFound = true;
          indicators.push(`AI Generation Metadata signature detected (${kw}) in file header/metadata.`);
          suspicionScore += 45;
          break;
        }
      }

      // 2. Decode Image with Jimp
      let img = null;
      try {
        img = await Jimp.read(rawBuffer);
      } catch (readErr) {
        indicators.push(`Synthetic analysis limited: Unable to decode image buffer (${readErr.message}).`);
        return {
          syntheticScore: 20,
          suspicionLevel: "INCONCLUSIVE",
          indicators,
          metrics: { error: readErr.message },
          methodology: "Local spatial gradient & edge distribution heuristics.",
          limitations: "Image decoding failed.",
        };
      }

      const { width, height } = img;
      computedRatio = Number((Math.max(width, height) / Math.max(1, Math.min(width, height))).toFixed(2));

      // 3. Aspect Ratio & Geometry Heuristic
      // ICAO ID-3 (Passports) standard ratio: 125mm / 88mm = 1.42 (range 1.25 to 1.60)
      // ICAO ID-1 (National IDs, Driver Licenses) standard ratio: 85.6mm / 53.98mm = 1.58 (range 1.40 to 1.75)
      // Diffusion models frequently generate square (1.00) or panoramic (1.77) images
      if (documentType === "Passport") {
        if (computedRatio < 1.15) {
          isRatioAnomaly = true;
          indicators.push(`Geometric Template Anomaly: Image has square/near-square aspect ratio (${computedRatio}:1), inconsistent with standard ICAO ID-3 passport format (1.42:1). Characteristic of AI diffusion canvas generation.`);
          suspicionScore += 35;
        } else if (computedRatio > 1.80) {
          isRatioAnomaly = true;
          indicators.push(`Geometric Template Anomaly: Image aspect ratio (${computedRatio}:1) strongly deviates from ICAO ID-3 standard (1.42:1).`);
          suspicionScore += 20;
        }
      } else if (documentType === "National ID" || documentType === "Driving License") {
        if (computedRatio < 1.20) {
          isRatioAnomaly = true;
          indicators.push(`Geometric Template Anomaly: Image aspect ratio (${computedRatio}:1) diverges from ICAO ID-1 card format (1.58:1).`);
          suspicionScore += 30;
        }
      }

      // 4. Sample Laplacian Edge Variance (Sharpness vs Smoothing)
      // Genuine printed credentials have distinct micro-edges (ink on paper, halftone screen, guilloche patterns).
      // AI diffusion renderings often have unnatural softness in high-frequency patterns while text boundaries lack printing micro-texture.
      const sampleW = Math.min(width, 400);
      const sampleH = Math.min(height, 400);
      const sampleImg = img.clone().resize({ w: sampleW, h: sampleH }).greyscale();

      const edgeValues = [];
      let edgeSum = 0;

      // Sample 3x3 Laplacian on grid
      for (let y = 1; y < sampleH - 1; y += 4) {
        for (let x = 1; x < sampleW - 1; x += 4) {
          const cCenter = (sampleImg.getPixelColor(x, y) >> 24) & 0xff;
          const cTop = (sampleImg.getPixelColor(x, y - 1) >> 24) & 0xff;
          const cBottom = (sampleImg.getPixelColor(x, y + 1) >> 24) & 0xff;
          const cLeft = (sampleImg.getPixelColor(x - 1, y) >> 24) & 0xff;
          const cRight = (sampleImg.getPixelColor(x + 1, y) >> 24) & 0xff;

          // Discrete Laplacian: 4*center - top - bottom - left - right
          const laplacian = Math.abs(4 * cCenter - cTop - cBottom - cLeft - cRight);
          edgeValues.push(laplacian);
          edgeSum += laplacian;
        }
      }

      const meanEdge = edgeValues.length > 0 ? edgeSum / edgeValues.length : 0;
      const varianceSum = edgeValues.reduce((acc, val) => acc + Math.pow(val - meanEdge, 2), 0);
      edgeVariance = edgeValues.length > 0 ? Number(Math.sqrt(varianceSum / edgeValues.length).toFixed(1)) : 0;

      // Real printed documents with fine print typically produce edge variance in range 25 - 65.
      // Unnaturally low edge variance (< 14) indicates severe over-smoothing (common in synthetic image models).
      if (edgeVariance < 14) {
        indicators.push(`Frequency Anomaly: Abnormally low spatial edge variance (${edgeVariance}). Image exhibits uniform over-smoothing characteristic of AI-synthesized credentials.`);
        suspicionScore += 25;
      } else if (edgeVariance < 18) {
        indicators.push(`Spatial sharpness anomaly: Reduced edge gradient variance (${edgeVariance}). Potential synthetic texture.`);
        suspicionScore += 12;
      }

      // 5. Texture Uniformity in Non-Text Zones
      // AI images often have synthetic noise that is mathematically uniform across the canvas.
      // Measure standard deviation across 4 distinct quadrant patches.
      const quadrantMeans = [];
      const qW = Math.floor(sampleW / 2);
      const qH = Math.floor(sampleH / 2);

      for (let qy = 0; qy < 2; qy++) {
        for (let qx = 0; qx < 2; qx++) {
          let qSum = 0;
          let qCount = 0;
          for (let y = qy * qH; y < (qy + 1) * qH; y += 6) {
            for (let x = qx * qW; x < (qx + 1) * qW; x += 6) {
              const val = (sampleImg.getPixelColor(x, y) >> 24) & 0xff;
              qSum += val;
              qCount++;
            }
          }
          quadrantMeans.push(qCount > 0 ? qSum / qCount : 128);
        }
      }

      const qAvg = quadrantMeans.reduce((a, b) => a + b, 0) / quadrantMeans.length;
      const qVar = quadrantMeans.reduce((acc, val) => acc + Math.pow(val - qAvg, 2), 0) / quadrantMeans.length;
      textureUniformityScore = Number(Math.sqrt(qVar).toFixed(1));

      // If background is unnaturally uniform or lacks authentic passport pattern variations
      if (textureUniformityScore < 8 && edgeVariance < 16) {
        indicators.push(`Substrate Anomaly: Background optical density distribution lacks natural physical document print variations (Uniformity score: ${textureUniformityScore}).`);
        suspicionScore += 20;
      }

      // Resolution check: Low-resolution scans naturally have lower edge variance; do not falsely trigger extreme AI suspicion
      if (width < 450 || height < 450) {
        indicators.push(`Low-resolution scan (${width}x${height}px) reduces edge variance certainty.`);
      }

      const finalScore = Math.min(95, Math.max(5, suspicionScore));

      let suspicionLevel = "LOW_SUSPICION";
      if (finalScore >= 70) {
        suspicionLevel = "HIGH_SUSPICION";
      } else if (finalScore >= 35) {
        suspicionLevel = "MEDIUM_SUSPICION";
      }

      return {
        syntheticScore: finalScore,
        suspicionLevel,
        status: suspicionLevel,
        score: finalScore,
        confidence: "HEURISTIC",
        method: "Local spatial gradient, edge variance, and template geometry heuristic analysis",
        indicators,
        metrics: {
          edgeVariance,
          textureUniformityScore,
          aspectRatio: computedRatio,
          aspectRatioAnomaly: isRatioAnomaly,
          aiMetadataFound,
        },
        isHeuristic: true,
        methodology: "Local image-forensic heuristics: spatial Laplacian edge variance, substrate texture uniformity, template aspect ratio validation, and metadata marker scanning.",
        limitations: "Heuristic spatial and geometric analysis. Indicates anomalies common to synthetic/AI generation; not a trained deep-learning neural discriminator.",
      };
    } catch (err) {
      console.error("[SyntheticDetectionService] Error during synthetic analysis:", err.message);
      return {
        syntheticScore: 20,
        suspicionLevel: "INCONCLUSIVE",
        status: "INCONCLUSIVE",
        score: 20,
        confidence: "HEURISTIC",
        method: "Local spatial gradient & edge distribution heuristics.",
        indicators: [`Synthetic detection encountered processing exception: ${err.message}`],
        metrics: { error: err.message },
        isHeuristic: true,
        methodology: "Local spatial gradient & edge distribution heuristics.",
        limitations: "Error during processing.",
      };
    }
  }
}
