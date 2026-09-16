// validationService.js
// Rule-based document consistency & integrity validation engine
// Consumes actual OCR and MRZ output with explicit check explanations.

export class ValidationService {
  /**
   * Validate document rules against extracted attributes
   * @param {string} documentType
   * @param {object} ocrData - Extracted OCR/MRZ data
   * @param {string|null} scenario - SIH scenario ID or null for real
   */
  static validate(documentType, ocrData = {}, scenario = null) {
    const issues = [];
    const checksPerformed = [];
    let score = 96;

    // =========================================================================
    // BRANCH A: DETERMINISTIC SIH DEMO SCENARIOS
    // =========================================================================
    if (scenario === "scenario-1") {
      return {
        score: "96%",
        numericScore: 96,
        passed: true,
        status: "pass",
        issues: [],
        checksPerformed: [
          "Required identity fields present",
          "Document number format valid",
          "Expiration date valid (May 2032)",
          "MRZ check digits verified",
          "Issue/Expiry chronology consistent"
        ],
        summary: "Document format and dates are consistent with issuance standards.",
      };
    }

    if (scenario === "scenario-2") {
      return {
        score: "72%",
        numericScore: 72,
        passed: true,
        status: "warning",
        issues: [
          {
            rule: "STAY_DURATION_DISCREPANCY",
            field: "stayDuration",
            severity: "Medium",
            message: "Visa validity duration (90 Days) contradicts immigration stamp limit (30 Days).",
          },
        ],
        checksPerformed: [
          "Required visa fields present",
          "Visa number format valid",
          "Stay duration check",
          "Issuing authority check"
        ],
        summary: "Visa validity duration (90 Days) contradicts immigration stamp limit (30 Days).",
      };
    }

    if (scenario === "scenario-3") {
      return {
        score: "60%",
        numericScore: 60,
        passed: false,
        status: "warning",
        issues: [
          {
            rule: "EXPIRATION_CHRONOLOGY_MISMATCH",
            field: "dateOfExpiry",
            severity: "High",
            message: "Visual expiration date does not align with encrypted MRZ checksum year.",
          },
          {
            rule: "IDENTITY_DATE_INCONSISTENCY",
            field: "dateOfBirth",
            severity: "Medium",
            message: "Visual date of birth has discrepancy with underlying machine-readable zone.",
          },
        ],
        checksPerformed: [
          "MRZ checksum verification",
          "Cross-field date comparison",
          "Visual zone vs machine zone alignment"
        ],
        summary: "Visual expiration date does not align with encrypted MRZ checksum year; Visual date of birth has discrepancy with underlying machine-readable zone.",
      };
    }

    if (scenario === "scenario-4") {
      return {
        score: "54%",
        numericScore: 54,
        passed: false,
        status: "fail",
        issues: [
          {
            rule: "CHECKSUM_INTEGRITY_FAILURE",
            field: "mrz",
            severity: "High",
            message: "Machine Readable Zone check digit mismatch detected in document number.",
          },
          {
            rule: "SECURITY_ZONE_ANOMALY",
            field: "issuingCountry",
            severity: "High",
            message: "Issuing country security code format fails ICAO 9303 compliance standard.",
          },
        ],
        checksPerformed: [
          "ICAO 9303 compliance check",
          "MRZ check digit validation",
          "Issuing state security code check"
        ],
        summary: "Machine Readable Zone check digit mismatch detected in document number; Issuing country security code format fails ICAO 9303 compliance standard.",
      };
    }

    // =========================================================================
    // BRANCH B: REAL DOCUMENT VALIDATION (CONSUMING ACTUAL OCR OUTPUT)
    // =========================================================================

    // CHECK 1: Required Fields Check
    checksPerformed.push("Required identity attributes inspection");
    const requiredByDoc = {
      Passport: ["fullName", "documentNumber", "dateOfBirth", "dateOfExpiry"],
      Visa: ["fullName", "documentNumber", "dateOfExpiry"],
      "National ID": ["fullName", "documentNumber"],
      "Driving License": ["fullName", "documentNumber", "dateOfExpiry"],
      Permit: ["fullName", "documentNumber", "dateOfExpiry"],
    };

    const needed = requiredByDoc[documentType] || ["fullName", "documentNumber"];
    const missing = [];
    for (const f of needed) {
      if (!ocrData[f]) {
        missing.push(f);
      }
    }

    if (missing.length > 0) {
      issues.push({
        rule: "REQUIRED_FIELDS_MISSING",
        field: missing.join(", "),
        severity: missing.includes("documentNumber") || missing.includes("fullName") ? "High" : "Medium",
        message: `Required identity attribute(s) [${missing.join(", ")}] could not be reliably extracted from document.`,
      });
      score -= Math.min(40, missing.length * 15);
    }

    // CHECK 2: Document Expiration relative to current date
    checksPerformed.push("Document validity and expiration check");
    const rawExpiry = ocrData.dateOfExpiryIso || ocrData.dateOfExpiry;
    if (rawExpiry) {
      const parsedExpiry = new Date(rawExpiry);
      const now = new Date();

      if (!isNaN(parsedExpiry.getTime())) {
        if (parsedExpiry < now) {
          issues.push({
            rule: "DOCUMENT_EXPIRED",
            field: "dateOfExpiry",
            severity: "High",
            message: `Document expired on ${parsedExpiry.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}. Credential is not valid for travel.`,
          });
          score -= 35;
        }
      }
    } else {
      issues.push({
        rule: "EXPIRATION_DATE_UNAVAILABLE",
        field: "dateOfExpiry",
        severity: "Medium",
        message: "Document expiration date could not be determined from optical scan.",
      });
      score -= 15;
    }

    // CHECK 3: MRZ Check Digit Validation (ICAO Doc 9303)
    let verifiedFailedChecksumCount = 0;
    let checksumUncertaintyCount = 0;
    const checksumDetails = [];

    if (ocrData.mrzData?.checkDigits) {
      checksPerformed.push("ICAO Doc 9303 MRZ check digits verification");
      const cd = ocrData.mrzData.checkDigits;

      for (const key of ["documentNumber", "dateOfBirth", "dateOfExpiry", "composite"]) {
        if (cd[key]) {
          const isExpectedValidDigit = typeof cd[key].expected === "string" && /^[0-9]$/.test(cd[key].expected);
          const isVerified = cd[key].isVerifiedMismatch !== undefined
            ? Boolean(cd[key].isVerifiedMismatch)
            : (!cd[key].valid && isExpectedValidDigit);
          const isUncertain = cd[key].isUncertain !== undefined
            ? Boolean(cd[key].isUncertain)
            : (!cd[key].valid && !isExpectedValidDigit);

          const detail = {
            field: cd[key].field || key,
            expected: cd[key].expected,
            computed: cd[key].computed || cd[key].calculated,
            passed: Boolean(cd[key].passed !== undefined ? cd[key].passed : cd[key].valid),
            valid: Boolean(cd[key].passed !== undefined ? cd[key].passed : cd[key].valid),
            isVerifiedMismatch: isVerified,
            isUncertain,
            uncertaintyReason: cd[key].uncertaintyReason || (isUncertain ? "MALFORMED_OR_MISSING_DIGIT" : null)
          };
          checksumDetails.push(detail);

          if (isVerified && key !== "composite") {
            verifiedFailedChecksumCount++;
          } else if (isUncertain) {
            checksumUncertaintyCount++;
          }

          if (isVerified) {
            const ruleMap = {
              documentNumber: "MRZ_DOC_CHECK_DIGIT_FAILED",
              dateOfBirth: "MRZ_DOB_CHECK_DIGIT_FAILED",
              dateOfExpiry: "MRZ_EXPIRY_CHECK_DIGIT_FAILED",
              composite: "MRZ_COMPOSITE_CHECK_DIGIT_FAILED"
            };
            const labelMap = {
              documentNumber: "Document Number",
              dateOfBirth: "Date of Birth",
              dateOfExpiry: "Expiry Date",
              composite: "Composite Data"
            };
            const deductionMap = {
              documentNumber: 30,
              dateOfBirth: 25,
              dateOfExpiry: 30,
              composite: 20
            };
            issues.push({
              rule: ruleMap[key] || "MRZ_CHECK_DIGIT_FAILED",
              field: key,
              severity: "High",
              message: `MRZ ${labelMap[key]} check digit verified mismatch (Expected: ${cd[key].expected}, Computed: ${cd[key].computed || cd[key].calculated}). Cryptographic inconsistency indicates potential alteration.`,
            });
            score -= (deductionMap[key] || 25);
          } else if (isUncertain) {
            issues.push({
              rule: "MRZ_CHECK_DIGIT_UNCERTAIN",
              field: key,
              severity: "Medium",
              message: `MRZ ${key} check digit could not be verified with cryptographic certainty (${detail.uncertaintyReason}). Classified as optical/formatting uncertainty, not confirmed fraud.`,
            });
            score -= 15;
          }
        }
      }

      if (verifiedFailedChecksumCount >= 2) {
        issues.push({
          rule: "MULTIPLE_MRZ_CHECKSUM_FAILURES",
          field: "mrz",
          severity: "High",
          message: `Multiple ICAO Doc 9303 check digits failed recalculation (${verifiedFailedChecksumCount} verified failures). Indicates systematic cryptographic forgery or artificial MRZ generation.`,
        });
      }
    } else if (documentType === "Passport") {
      issues.push({
        rule: "MRZ_UNAVAILABLE",
        field: "mrz",
        severity: "Medium",
        message: "Standard ICAO Doc 9303 Machine Readable Zone could not be parsed from passport optical scan.",
      });
      checksumUncertaintyCount++;
      score -= 15;
    }

    // CHECK 4: Cross-Field Consistency (Visual zone vs MRZ zone)
    if (ocrData.mrzData && ocrData.visualFields) {
      checksPerformed.push("Cross-field consistency check (Visual Zone vs MRZ)");
      const visDoc = (ocrData.visualFields.documentNumber || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const mrzDoc = (ocrData.mrzData.documentNumber || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

      if (visDoc && mrzDoc && visDoc.length > 5 && mrzDoc.length > 5 && visDoc !== mrzDoc) {
        issues.push({
          rule: "DOCUMENT_NUMBER_MISMATCH",
          field: "documentNumber",
          severity: "High",
          message: `Document Number discrepancy: Visual zone shows '${visDoc}' while MRZ shows '${mrzDoc}'.`,
        });
        score -= 35;
      }
    }

    // CHECK 5: Date Chronology Checks (DOB vs Issue vs Expiry)
    if (ocrData.dateOfBirth && ocrData.dateOfExpiry) {
      checksPerformed.push("Date chronology sanity inspection");
      const dob = new Date(ocrData.dateOfBirthIso || ocrData.dateOfBirth);
      const exp = new Date(ocrData.dateOfExpiryIso || ocrData.dateOfExpiry);

      if (!isNaN(dob.getTime()) && !isNaN(exp.getTime())) {
        if (dob >= exp) {
          issues.push({
            rule: "CHRONOLOGY_INCONSISTENCY",
            field: "dateOfBirth",
            severity: "High",
            message: "Date of Birth occurs on or after Document Expiration Date.",
          });
          score -= 30;
        }

        const now = new Date();
        if (dob > now) {
          issues.push({
            rule: "DOB_FUTURE_INVALID",
            field: "dateOfBirth",
            severity: "High",
            message: "Date of Birth is in the future.",
          });
          score -= 30;
        }
      }
    }

    // Determine final status
    const highIssues = issues.filter((i) => i.severity === "High");
    const mediumIssues = issues.filter((i) => i.severity === "Medium");

    const finalScore = Math.max(10, Math.min(99, score));
    const passed = highIssues.length === 0;

    let status = "pass";
    if (highIssues.length > 0 || finalScore < 60) {
      status = "fail";
    } else if (mediumIssues.length > 0 || finalScore < 85) {
      status = "warning";
    }

    const summary =
      issues.length === 0
        ? "Document format, dates, and check digits are consistent with official issuance standards."
        : issues.map((i) => i.message).join(" | ");

    return {
      score: `${finalScore}%`,
      numericScore: finalScore,
      passed,
      status,
      issues,
      checksPerformed,
      checksumDetails: checksumDetails || [],
      failedChecksumCount: verifiedFailedChecksumCount,
      verifiedFailedChecksumCount,
      checksumUncertaintyCount,
      hasChecksumFail: verifiedFailedChecksumCount > 0,
      hasVerifiedChecksumFail: verifiedFailedChecksumCount > 0,
      hasMultipleChecksumFailures: verifiedFailedChecksumCount >= 2,
      hasChecksumUncertainty: checksumUncertaintyCount > 0,
      summary,
    };
  }
}
