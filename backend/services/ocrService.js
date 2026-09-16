// ocrService.js
// Genuine OCR Extraction using Tesseract.js & ICAO Doc 9303 MRZ parser
// Clearly separates deterministic SIH Demo Scenarios from real document screening.

import { createWorker } from "tesseract.js";
import { findAndParseMRZ, extractVisualFields } from "../utils/mrzParser.js";
import fs from "fs";

export class OCRService {
  /**
   * Main extraction entry point
   * @param {string} documentType - Officer-selected document type
   * @param {object} fileInfo - Multer file metadata (path, originalname, mimetype)
   * @param {string|null} scenario - SIH demo scenario ID ("scenario-1" to "scenario-4") or null for real
   */
  static async extract(documentType = "Passport", fileInfo = null, scenario = null) {
    const startTime = Date.now();

    // =========================================================================
    // BRANCH A: DETERMINISTIC SIH 2026 DEMO SCENARIOS
    // =========================================================================
    if (scenario === "scenario-1") {
      return {
        fullName: "Rahul Sharma",
        documentType: "Passport",
        documentNumber: "P89201442",
        nationality: "Indian",
        dateOfBirth: "14 May 2002",
        dateOfBirthIso: "2002-05-14",
        gender: "Male",
        dateOfIssue: "14 May 2022",
        dateOfExpiry: "14 May 2032",
        dateOfExpiryIso: "2032-05-14",
        placeOfBirth: "New Delhi, IND",
        issuingCountry: "IND",
        mrz: "P<INDRSHARMA<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<\nP89201442<8IND0205142M3205144<<<<<<<<<<<<<<06",
        confidence: 0.98,
        fieldsDetected: 10,
        extractionTimeMs: 412,
        isDemoScenario: true,
        documentTypeSource: "Demo Scenario 1 Preset",
      };
    }

    if (scenario === "scenario-2") {
      return {
        fullName: "Daniel Wilson",
        documentType: "Visa",
        visaNumber: "V-9921048",
        visaType: "Tourist / Business (B1/B2)",
        passportNumber: "GBR-902188",
        nationality: "British",
        dateOfBirth: "08 Sep 1988",
        dateOfBirthIso: "1988-09-08",
        issueDate: "10 Jan 2026",
        expiryDate: "10 Jul 2026",
        dateOfExpiry: "10 Jul 2026",
        dateOfExpiryIso: "2026-07-10",
        entryType: "Multiple Entry",
        stayDuration: "90 Days (Discrepancy: Stamp says 30 Days)",
        issuingAuthority: "UK Visa Application Centre, London",
        confidence: 0.92,
        fieldsDetected: 9,
        extractionTimeMs: 440,
        isDemoScenario: true,
        documentTypeSource: "Demo Scenario 2 Preset",
      };
    }

    if (scenario === "scenario-3") {
      return {
        fullName: "Elena Rostova",
        documentType: "Passport",
        documentNumber: "P89123450",
        nationality: "Ukrainian",
        dateOfBirth: "22 Nov 1994 (Altered from 1984)",
        dateOfBirthIso: "1994-11-22",
        gender: "Female",
        dateOfIssue: "15 Jan 2019",
        dateOfExpiry: "15 Jan 2029 (Altered from 2024)",
        dateOfExpiryIso: "2029-01-15",
        placeOfBirth: "Kyiv, UKR",
        issuingCountry: "UKR",
        mrz: "P<UKRROSTOVA<<ELENA<<<<<<<<<<<<<<<<<<<<<<\nP89123450<2UKR8411225F2401158<<<<<<<<<<<<<<02",
        confidence: 0.84,
        fieldsDetected: 10,
        extractionTimeMs: 460,
        isDemoScenario: true,
        documentTypeSource: "Demo Scenario 3 Preset",
      };
    }

    if (scenario === "scenario-4") {
      return {
        fullName: "Tariq Al-Mansoor",
        documentType: "Passport",
        documentNumber: "M90124881",
        nationality: "Syrian",
        dateOfBirth: "03 Mar 1981",
        dateOfBirthIso: "1981-03-03",
        gender: "Male",
        dateOfIssue: "11 Aug 2020",
        dateOfExpiry: "11 Aug 2030",
        dateOfExpiryIso: "2030-08-11",
        placeOfBirth: "Damascus, SYR",
        issuingCountry: "SYR",
        mrz: "P<SYRALMANSOOR<<TARIQ<<<<<<<<<<<<<<<<<<<<<\nM90124881<1SYR8103031M3008112<<<<<<<<<<<<<<04",
        confidence: 0.78,
        fieldsDetected: 10,
        extractionTimeMs: 510,
        isDemoScenario: true,
        documentTypeSource: "Demo Scenario 4 Preset",
      };
    }

    // =========================================================================
    // BRANCH B: REAL DOCUMENT PROCESSING (NO SCENARIO / REAL UPLOAD)
    // =========================================================================
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
        isDemoScenario: false,
        documentTypeSource: "Officer Supplied",
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
          isDemoScenario: false,
          documentTypeSource: "Officer Supplied",
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
        rawText: rawText.substring(0, 1000), // First 1000 chars for logging/debugging
        confidence: Number(rawConfidence.toFixed(2)),
        ocrStatus,
        fieldsDetected: detectedFieldsCount,
        extractionTimeMs: Date.now() - startTime,
        isDemoScenario: false,
        documentTypeSource: mrzResult ? "ICAO Doc 9303 MRZ Detected" : "Officer Supplied",
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
        isDemoScenario: false,
        documentTypeSource: "Officer Supplied",
        error: err.message,
      };
    } finally {
      if (worker) {
        await worker.terminate().catch(() => {});
      }
    }
  }
}
