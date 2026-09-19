// ocrService.js
// OCR Extraction using Tesseract.js & ICAO Doc 9303 MRZ parser

import { createWorker } from "tesseract.js";
import { findAndParseMRZ, extractVisualFields } from "../utils/mrzParser.js";
import fs from "fs";

export class OCRService {
  /**
   * Main extraction entry point
   * @param {string} documentType - User-selected document type
   * @param {object} fileInfo - Multer file metadata (path, originalname, mimetype)
   */
  static async extract(documentType = "Passport", fileInfo = null) {
    const startTime = Date.now();

    if (!fileInfo || !fileInfo.path || !fs.existsSync(fileInfo.path)) {
      return {
        fullName: null,
        documentType: documentType || "Unknown",
        documentNumber: null,
        nationality: null,
        dateOfBirth: null,
        dateOfExpiry: null,
        ocrStatus: "FAILED_NO_FILE",
        confidence: 0.0,
        fieldsDetected: 0,
        extractionTimeMs: Date.now() - startTime,
        documentTypeSource: "User Supplied",
        message: "No document file was provided for optical analysis.",
      };
    }

    let worker = null;
    try {
      const buf = fs.readFileSync(fileInfo.path);
      const isJpeg = buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
      const isPng = buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
      const isWebp = buf.length >= 12 && buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && buf.subarray(8, 12).toString() === 'WEBP';
      const isBmp = buf.length >= 2 && buf[0] === 0x42 && buf[1] === 0x4D;
      const isTiff = buf.length >= 4 && ((buf[0] === 0x49 && buf[1] === 0x49) || (buf[0] === 0x4D && buf[1] === 0x4D));

      if (!isJpeg && !isPng && !isWebp && !isBmp && !isTiff) {
        return {
          fullName: null,
          documentType: documentType || "Unknown",
          documentNumber: null,
          nationality: null,
          dateOfBirth: null,
          dateOfExpiry: null,
          ocrStatus: "FAILED_PROCESSING_ERROR",
          confidence: 0.0,
          fieldsDetected: 0,
          extractionTimeMs: Date.now() - startTime,
          documentTypeSource: "User Supplied",
          error: "Unreadable or corrupted image format",
        };
      }

      worker = await createWorker("eng");
      const { data } = await worker.recognize(fileInfo.path);
      const rawText = data.text || "";
      const rawConfidence = data.confidence ? Math.min(0.99, Math.max(0.1, data.confidence / 100)) : 0.5;

      // 1. Try parsing Machine Readable Zone (MRZ)
      const mrzResult = findAndParseMRZ(rawText, rawConfidence);

      // 2. Extract visual fields from visible text
      const visualFields = extractVisualFields(rawText, documentType);

      // 3. Synthesize extracted information
      const fullName = mrzResult?.fullName || visualFields.fullName || null;
      const documentNumber = mrzResult?.documentNumber || visualFields.documentNumber || null;
      const nationality = mrzResult?.nationality || visualFields.nationality || null;
      const dateOfBirth = mrzResult?.dateOfBirth || visualFields.dateOfBirth || null;
      const dateOfExpiry = mrzResult?.dateOfExpiry || visualFields.dateOfExpiry || null;
      const gender = mrzResult?.gender || visualFields.gender || null;
      const dateOfIssue = visualFields.dateOfIssue || null;
      const issuingCountry = mrzResult?.issuingCountry || visualFields.nationality || null;

      // Calculate how many distinct attributes were successfully parsed
      const detectedFieldsCount = [fullName, documentNumber, dateOfBirth, dateOfExpiry, nationality, gender]
        .filter(Boolean).length;

      const ocrStatus = detectedFieldsCount >= 3 ? "SUCCESS" : detectedFieldsCount >= 1 ? "PARTIAL" : "LOW_CONFIDENCE";

      return {
        fullName,
        documentType: mrzResult ? mrzResult.documentType : documentType,
        documentNumber,
        nationality,
        dateOfBirth,
        dateOfBirthIso: mrzResult?.dateOfBirthIso || null,
        gender,
        dateOfIssue,
        dateOfExpiry,
        dateOfExpiryIso: mrzResult?.dateOfExpiryIso || null,
        placeOfBirth: visualFields.placeOfBirth || null,
        issuingCountry,
        mrz: mrzResult ? mrzResult.rawMrz : null,
        mrzData: mrzResult || null,
        visualFields,
        confidence: Number(rawConfidence.toFixed(2)),
        ocrStatus,
        fieldsDetected: detectedFieldsCount,
        extractionTimeMs: Date.now() - startTime,
        documentTypeSource: mrzResult ? "ICAO Doc 9303 MRZ Detected" : "User Supplied",
      };
    } catch (err) {
      console.error("[OCRService] Error running Tesseract OCR:", err.message);
      return {
        fullName: null,
        documentType,
        documentNumber: null,
        nationality: null,
        dateOfBirth: null,
        dateOfExpiry: null,
        ocrStatus: "FAILED_PROCESSING_ERROR",
        confidence: 0.0,
        fieldsDetected: 0,
        extractionTimeMs: Date.now() - startTime,
        documentTypeSource: "User Supplied",
      };
    } finally {
      if (worker) {
        await worker.terminate().catch(() => {});
      }
    }
  }
}
