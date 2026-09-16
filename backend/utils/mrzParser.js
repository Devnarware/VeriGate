// utils/mrzParser.js
// Standard ICAO Doc 9303 MRZ (Machine Readable Zone) Parser & Validator

const CHAR_VALUES = {
  '<': 0, '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17, 'I': 18, 'J': 19,
  'K': 20, 'L': 21, 'M': 22, 'N': 23, 'O': 24, 'P': 25, 'Q': 26, 'R': 27, 'S': 28, 'T': 29,
  'U': 30, 'V': 31, 'W': 32, 'X': 33, 'Y': 34, 'Z': 35
};

const WEIGHTS = [7, 3, 1];

export function calculateCheckDigit(str) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i].toUpperCase();
    const val = CHAR_VALUES[ch] || 0;
    const weight = WEIGHTS[i % 3];
    sum += val * weight;
  }
  return (sum % 10).toString();
}

/**
 * Evaluates a single check digit distinguishing verified cryptographic failure
 * from optical / structural / formatting uncertainty.
 */
export function evaluateCheckDigit(field, rawData, expectedLen, suppliedCheck, ocrConfidence = 1.0) {
  const isCheckDigitValidFormat = typeof suppliedCheck === 'string' && /^[0-9]$/.test(suppliedCheck);
  const isDataLengthValid = typeof rawData === 'string' && rawData.length === expectedLen;
  const isDataCharactersValid = typeof rawData === 'string' && /^[0-9A-Z<]+$/.test(rawData);
  const isConfidenceAcceptable = typeof ocrConfidence !== 'number' || ocrConfidence >= 0.45;

  const calcCheck = calculateCheckDigit(rawData || '');

  // If check digit is missing, malformed, or field data length/chars abnormal, or OCR confidence low:
  if (!isCheckDigitValidFormat || !isDataLengthValid || !isDataCharactersValid || !isConfidenceAcceptable) {
    let uncertaintyReason = 'MALFORMED_CHECK_DIGIT';
    if (!isConfidenceAcceptable) {
      uncertaintyReason = 'LOW_OCR_CONFIDENCE';
    } else if (!isDataLengthValid) {
      uncertaintyReason = 'ABNORMAL_FIELD_LENGTH';
    } else if (!isDataCharactersValid) {
      uncertaintyReason = 'INVALID_FIELD_CHARACTERS';
    }

    return {
      field,
      expected: suppliedCheck,
      computed: calcCheck,
      calculated: calcCheck,
      valid: false,
      passed: false,
      isVerifiedMismatch: false, // NOT a verified cryptographic failure
      isUncertain: true,         // Classified as uncertainty
      uncertaintyReason,
    };
  }

  const matches = suppliedCheck === calcCheck;
  return {
    field,
    expected: suppliedCheck,
    computed: calcCheck,
    calculated: calcCheck,
    valid: matches,
    passed: matches,
    isVerifiedMismatch: !matches, // Confirmed cryptographic failure under valid formatting
    isUncertain: false,
    uncertaintyReason: null,
  };
}

export function parseDateYYMMDD(str, isExpiry = false) {
  if (!str || str.length < 6 || !/^\d{6}$/.test(str)) return null;
  const yy = parseInt(str.substring(0, 2), 10);
  const mm = parseInt(str.substring(2, 4), 10);
  const dd = parseInt(str.substring(4, 6), 10);

  const currentYear = new Date().getFullYear();
  const currentYY = currentYear % 100;

  let century = 1900;
  if (isExpiry) {
    // Expiry dates are typically in the current century or next
    century = yy <= (currentYY + 50) ? 2000 : 1900;
  } else {
    // DOB: if yy <= currentYY, typically born 2000s, else 1900s
    century = yy <= currentYY ? 2000 : 1900;
  }

  const fullYear = century + yy;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = months[mm - 1] || "Jan";

  const iso = `${fullYear}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  const formatted = `${String(dd).padStart(2, '0')} ${monthName} ${fullYear}`;

  return { iso, formatted, year: fullYear, month: mm, day: dd };
}

export function findAndParseMRZ(rawText, ocrConfidence = 1.0) {
  if (!rawText) return null;

  const lines = rawText
    .split(/\r?\n/)
    .map(line => line.trim().replace(/\s+/g, '').toUpperCase())
    .filter(line => line.includes('<') && line.length >= 28);

  // Look for TD3 (Passport: 2 lines of 44 chars)
  for (let i = 0; i < lines.length - 1; i++) {
    const l1 = lines[i];
    const l2 = lines[i + 1];

    if ((l1.startsWith('P') || l1.startsWith('I') || l1.startsWith('V')) && l1.length >= 40 && l2.length >= 40) {
      // Clean to 44 chars if close
      const line1 = l1.padEnd(44, '<').substring(0, 44);
      const line2 = l2.padEnd(44, '<').substring(0, 44);

      return parseTD3(line1, line2, ocrConfidence);
    }
  }

  // Look for TD1 (National ID: 3 lines of 30 chars)
  if (lines.length >= 3) {
    for (let i = 0; i < lines.length - 2; i++) {
      const l1 = lines[i];
      const l2 = lines[i + 1];
      const l3 = lines[i + 2];
      if (l1.length >= 28 && l2.length >= 28 && l3.length >= 28) {
        return parseTD1(
          l1.padEnd(30, '<').substring(0, 30),
          l2.padEnd(30, '<').substring(0, 30),
          l3.padEnd(30, '<').substring(0, 30),
          ocrConfidence
        );
      }
    }
  }

  return null;
}

export function parseTD3(line1, line2, ocrConfidence = 1.0) {
  // Line 1: P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<
  const docType = line1.substring(0, 2).replace(/</g, '');
  const issuingCountry = line1.substring(2, 5).replace(/</g, '');
  const namePart = line1.substring(5);
  const nameSegments = namePart.split('<<').map(s => s.replace(/</g, ' ').trim()).filter(Boolean);
  const surname = nameSegments[0] || '';
  const givenNames = nameSegments[1] || '';
  const fullName = [givenNames, surname].filter(Boolean).join(' ') || surname || "Unknown";

  // Line 2: L898902C36UTO7408122F1204159ZE184226B<<<<<10
  const docNumberRaw = line2.substring(0, 9).replace(/</g, '');
  const docNumberCheckResult = evaluateCheckDigit("documentNumber", line2.substring(0, 9), 9, line2.substring(9, 10), ocrConfidence);

  const nationality = line2.substring(10, 13).replace(/</g, '');

  const dobRaw = line2.substring(13, 19);
  const dobCheckResult = evaluateCheckDigit("dateOfBirth", dobRaw, 6, line2.substring(19, 20), ocrConfidence);
  const parsedDob = parseDateYYMMDD(dobRaw, false);

  const sex = line2.substring(20, 21).replace(/</g, '') || 'Unspecified';

  const expiryRaw = line2.substring(21, 27);
  const expiryCheckResult = evaluateCheckDigit("dateOfExpiry", expiryRaw, 6, line2.substring(27, 28), ocrConfidence);
  const parsedExpiry = parseDateYYMMDD(expiryRaw, true);

  // TD3 Composite Check Digit (Covering DocNumber, DOB, and Expiry with optional data)
  let compositeCheckResult = null;
  if (line2.length >= 44) {
    const compositeData = line2.substring(0, 10) + line2.substring(13, 20) + line2.substring(21, 43);
    compositeCheckResult = evaluateCheckDigit("composite", compositeData, compositeData.length, line2.substring(43, 44), ocrConfidence);
  }

  const rawMrz = `${line1}\n${line2}`;
  const allValid = docNumberCheckResult.valid && dobCheckResult.valid && expiryCheckResult.valid && (compositeCheckResult ? compositeCheckResult.valid : true);

  return {
    format: "TD3 (ICAO Doc 9303)",
    rawMrz,
    fullName,
    surname,
    givenNames,
    documentType: docType.startsWith('P') ? 'Passport' : docType.startsWith('V') ? 'Visa' : 'Identity Card',
    documentNumber: docNumberRaw,
    issuingCountry,
    nationality,
    dateOfBirth: parsedDob?.formatted || null,
    dateOfBirthIso: parsedDob?.iso || null,
    gender: sex === 'M' ? 'Male' : sex === 'F' ? 'Female' : 'Unspecified',
    dateOfExpiry: parsedExpiry?.formatted || null,
    dateOfExpiryIso: parsedExpiry?.iso || null,
    checkDigits: {
      documentNumber: docNumberCheckResult,
      dateOfBirth: dobCheckResult,
      dateOfExpiry: expiryCheckResult,
      composite: compositeCheckResult,
      allValid,
      hasVerifiedMismatch: docNumberCheckResult.isVerifiedMismatch || dobCheckResult.isVerifiedMismatch || expiryCheckResult.isVerifiedMismatch,
      hasUncertainty: docNumberCheckResult.isUncertain || dobCheckResult.isUncertain || expiryCheckResult.isUncertain || (compositeCheckResult && compositeCheckResult.isUncertain),
      verifiedMismatchCount: [docNumberCheckResult, dobCheckResult, expiryCheckResult].filter(c => c.isVerifiedMismatch).length,
      uncertaintyCount: [docNumberCheckResult, dobCheckResult, expiryCheckResult, compositeCheckResult].filter(c => c && c.isUncertain).length,
    }
  };
}

export function parseTD1(line1, line2, line3, ocrConfidence = 1.0) {
  const docType = line1.substring(0, 2).replace(/</g, '');
  const issuingCountry = line1.substring(2, 5).replace(/</g, '');
  const docNumberRaw = line1.substring(5, 14).replace(/</g, '');
  const docNumberCheckResult = evaluateCheckDigit("documentNumber", line1.substring(5, 14), 9, line1.substring(14, 15), ocrConfidence);

  const dobRaw = line2.substring(0, 6);
  const dobCheckResult = evaluateCheckDigit("dateOfBirth", dobRaw, 6, line2.substring(6, 7), ocrConfidence);
  const parsedDob = parseDateYYMMDD(dobRaw, false);

  const sex = line2.substring(7, 8).replace(/</g, '') || 'Unspecified';

  const expiryRaw = line2.substring(8, 14);
  const expiryCheckResult = evaluateCheckDigit("dateOfExpiry", expiryRaw, 6, line2.substring(14, 15), ocrConfidence);
  const parsedExpiry = parseDateYYMMDD(expiryRaw, true);

  const nationality = line2.substring(15, 18).replace(/</g, '');

  const nameSegments = line3.split('<<').map(s => s.replace(/</g, ' ').trim()).filter(Boolean);
  const surname = nameSegments[0] || '';
  const givenNames = nameSegments[1] || '';
  const fullName = [givenNames, surname].filter(Boolean).join(' ') || surname || "Unknown";

  const allValid = docNumberCheckResult.valid && dobCheckResult.valid && expiryCheckResult.valid;

  return {
    format: "TD1 (ID Card 3-Line)",
    rawMrz: `${line1}\n${line2}\n${line3}`,
    fullName,
    documentType: "National ID",
    documentNumber: docNumberRaw,
    issuingCountry,
    nationality,
    dateOfBirth: parsedDob?.formatted || null,
    dateOfBirthIso: parsedDob?.iso || null,
    gender: sex === 'M' ? 'Male' : sex === 'F' ? 'Female' : 'Unspecified',
    dateOfExpiry: parsedExpiry?.formatted || null,
    dateOfExpiryIso: parsedExpiry?.iso || null,
    checkDigits: {
      documentNumber: docNumberCheckResult,
      dateOfBirth: dobCheckResult,
      dateOfExpiry: expiryCheckResult,
      allValid,
      hasVerifiedMismatch: docNumberCheckResult.isVerifiedMismatch || dobCheckResult.isVerifiedMismatch || expiryCheckResult.isVerifiedMismatch,
      hasUncertainty: docNumberCheckResult.isUncertain || dobCheckResult.isUncertain || expiryCheckResult.isUncertain,
      verifiedMismatchCount: [docNumberCheckResult, dobCheckResult, expiryCheckResult].filter(c => c.isVerifiedMismatch).length,
      uncertaintyCount: [docNumberCheckResult, dobCheckResult, expiryCheckResult].filter(c => c && c.isUncertain).length,
    }
  };
}


export function extractVisualFields(text, fallbackDocType = "Passport") {
  if (!text) return {};
  const cleaned = text.replace(/\r/g, '');
  const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);

  const extracted = {};

  // Document Number patterns
  const docNumMatch = text.match(/(?:Passport\s*(?:No|Number)?|Document\s*(?:No|Number)?|ID\s*(?:No|Number)?|Licence\s*No|License\s*No)[\s.:#]*([A-Z0-9]{6,12})/i) ||
                      text.match(/\b([A-PR-WY][0-9]{7,8})\b/) ||
                      text.match(/\b([A-Z]{1,2}[0-9]{6,9})\b/);
  if (docNumMatch) {
    extracted.documentNumber = docNumMatch[1].trim();
  }

  // Name patterns
  const nameMatch = text.match(/(?:Given\s*Names?|First\s*Name|Name|Full\s*Name)[\s.:]+([A-Z\s,\-]{2,40})/i) ||
                    text.match(/(?:Surname|Last\s*Name)[\s.:]+([A-Z\s,\-]{2,40})/i);
  if (nameMatch) {
    const raw = nameMatch[1].trim().replace(/\n/g, ' ').replace(/^,\s*|,\s*$/g, '');
    if (raw.length > 2 && !/passport|republic|identity|card|driver/i.test(raw)) {
      extracted.fullName = raw;
    }
  }

  // Nationality
  const natMatch = text.match(/(?:Nationality|Country|Citizen\s*of)[\s.:]+([A-Z]{3,20})/i);
  if (natMatch) {
    extracted.nationality = natMatch[1].trim();
  }

  // Dates: Expiry
  const expiryMatch = text.match(/(?:Date\s*of\s*Expiry|Expiry\s*Date|Expires?|Valid\s*Until)[\s.:]+([0-9]{1,2}[\/\-.][0-9]{1,2}[\/\-.][0-9]{2,4}|[0-9]{1,2}\s+[A-Za-z]{3,9}\s+[0-9]{4})/i);
  if (expiryMatch) {
    extracted.dateOfExpiry = expiryMatch[1].trim();
  }

  // Dates: DOB
  const dobMatch = text.match(/(?:Date\s*of\s*Birth|Birth\s*Date|DOB)[\s.:]+([0-9]{1,2}[\/\-.][0-9]{1,2}[\/\-.][0-9]{2,4}|[0-9]{1,2}\s+[A-Za-z]{3,9}\s+[0-9]{4})/i);
  if (dobMatch) {
    extracted.dateOfBirth = dobMatch[1].trim();
  }

  // Dates: Issue
  const issueMatch = text.match(/(?:Date\s*of\s*Issue|Issue\s*Date|Issued)[\s.:]+([0-9]{1,2}[\/\-.][0-9]{1,2}[\/\-.][0-9]{2,4}|[0-9]{1,2}\s+[A-Za-z]{3,9}\s+[0-9]{4})/i);
  if (issueMatch) {
    extracted.dateOfIssue = issueMatch[1].trim();
  }

  // Gender / Sex
  const sexMatch = text.match(/(?:Sex|Gender)[\s.:]+([MFX]|Male|Female)/i);
  if (sexMatch) {
    extracted.gender = sexMatch[1].toUpperCase().startsWith('M') ? 'Male' : sexMatch[1].toUpperCase().startsWith('F') ? 'Female' : 'Unspecified';
  }

  return extracted;
}
