export const initialWatchlist = [
  {
    id: "WL-001",
    name: "Tariq Al-Mansoor",
    documentNumber: "M90124881",
    nationality: "Syrian",
    reason: "Suspected Identity Forgery & Transnational Fraud Network",
    status: "ACTIVE",
    riskLevel: "CRITICAL",
    source: "Interpol Red Notice #A-2025-9921",
    addedDate: "2025-11-12",
  },
  {
    id: "WL-002",
    name: "Viktor Reznov",
    documentNumber: "RU8829104",
    nationality: "Russian",
    reason: "Reported Stolen Passport & Multiple Alias Travel",
    status: "ACTIVE",
    riskLevel: "HIGH",
    source: "Border Security Intelligence Bulletin",
    addedDate: "2026-01-08",
  },
  {
    id: "WL-003",
    name: "Kavita Nair",
    documentNumber: "Z44910283",
    nationality: "Indian",
    reason: "Immigration Visa Fraud & Counterfeit Stamp Carrier",
    status: "ACTIVE",
    riskLevel: "HIGH",
    source: "Consular Alert Advisory",
    addedDate: "2026-02-14",
  },
  {
    id: "WL-004",
    name: "Carlos Mendoza",
    documentNumber: "P77281900",
    nationality: "Colombian",
    reason: "Previously Expelled / Overstay Violation",
    status: "INACTIVE",
    riskLevel: "MEDIUM",
    source: "Immigration Control Database",
    addedDate: "2024-08-20",
  },
  {
    id: "WL-005",
    name: "Elena Rostova",
    documentNumber: "P89123450",
    nationality: "Ukrainian",
    reason: "Suspicious Document Tampering & Altered Expiry Date",
    status: "ACTIVE",
    riskLevel: "HIGH",
    source: "Airport Security Checkpoint Advisory",
    addedDate: "2026-03-01",
  }
];

export const initialScreenings = [
  {
    id: "VG-2026-10482",
    verificationId: "VG-2026-10482",
    personName: "Rahul Sharma",
    documentType: "Passport",
    documentNumber: "P8XXXX42",
    nationality: "Indian",
    riskScore: 18,
    riskLevel: "LOW",
    recommendation: "PROCEED",
    status: "Verified",
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    reasons: [
      "Required document information was successfully extracted.",
      "Document validity and integrity checks passed without warnings.",
      "No visual tampering or metadata anomalies detected.",
      "Strong biometric face similarity (96%).",
      "No matches found against security watchlist databases."
    ],
    recommendedAction: "Proceed with verification.",
    ocr: {
      fullName: "Rahul Sharma",
      documentType: "Passport",
      documentNumber: "P8XXXX42",
      nationality: "Indian",
      dateOfBirth: "14 May 2002",
      gender: "Male",
      dateOfIssue: "14 May 2022",
      dateOfExpiry: "14 May 2032",
      placeOfBirth: "New Delhi, IND",
      issuingCountry: "IND",
      mrz: "P<INDRSHARMA<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<\nP8XXXX42<8IND0205142M3205144<<<<<<<<<<<<<<06"
    },
    checks: [
      { id: "ocr", title: "OCR Extraction", description: "Required fields successfully extracted with 98% confidence.", status: "pass", score: "98%" },
      { id: "validation", title: "Document Validation", description: "Document number format and date ranges are valid.", status: "pass", score: "96%" },
      { id: "tampering", title: "Tampering Analysis", description: "No photo replacement, font anomalies, or compression edits.", status: "pass", score: "94%" },
      { id: "face", title: "Face Verification", description: "Document photo strongly matches presented identity.", status: "pass", score: "96%" },
      { id: "watchlist", title: "Watchlist Check", description: "Identity clear across all watchlist databases.", status: "pass", score: "CLEAR" }
    ],
    tampering: {
      tamperingScore: 6,
      tamperingRisk: "Low",
      indicators: [],
      confidence: 0.96
    },
    faceVerification: {
      similarity: 96,
      status: "Strong Match",
      confidence: 0.94
    },
    watchlist: {
      matched: false,
      matchDetails: null
    }
  },
  {
    id: "VG-2026-10481",
    verificationId: "VG-2026-10481",
    personName: "Daniel Wilson",
    documentType: "Visa",
    documentNumber: "V-9921048",
    nationality: "British",
    riskScore: 47,
    riskLevel: "MEDIUM",
    recommendation: "MANUAL REVIEW",
    status: "Review",
    timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    reasons: [
      "Stay duration does not match entry stamp dates.",
      "Moderate face verification similarity (68%).",
      "Minor font inconsistency detected in issuing authority field."
    ],
    recommendedAction: "Perform manual officer inspection of original visa stamp.",
    ocr: {
      fullName: "Daniel Wilson",
      documentType: "Visa",
      visaNumber: "V-9921048",
      passportNumber: "GBR-902188",
      nationality: "British",
      dateOfBirth: "08 Sep 1988",
      dateOfIssue: "10 Jan 2026",
      dateOfExpiry: "10 Jul 2026",
      entryType: "Multiple",
      stayDuration: "90 Days",
      issuingAuthority: "London High Commission"
    },
    checks: [
      { id: "ocr", title: "OCR Extraction", description: "Extracted information with minor font variance.", status: "pass", score: "92%" },
      { id: "validation", title: "Document Validation", description: "Stay duration inconsistency detected.", status: "warning", score: "72%" },
      { id: "tampering", title: "Tampering Analysis", description: "Possible font misalignment in authority region.", status: "warning", score: "68%" },
      { id: "face", title: "Face Verification", description: "Moderate similarity score requires manual check.", status: "warning", score: "68%" },
      { id: "watchlist", title: "Watchlist Check", description: "Identity clear across watchlist.", status: "pass", score: "CLEAR" }
    ],
    tampering: {
      tamperingScore: 34,
      tamperingRisk: "Medium",
      indicators: ["Font variance detected in authority text region"],
      confidence: 0.82
    },
    faceVerification: {
      similarity: 68,
      status: "Manual Review Required",
      confidence: 0.81
    },
    watchlist: {
      matched: false,
      matchDetails: null
    }
  },
  {
    id: "VG-2026-10480",
    verificationId: "VG-2026-10480",
    personName: "Elena Rostova",
    documentType: "Passport",
    documentNumber: "P89123450",
    nationality: "Ukrainian",
    riskScore: 74,
    riskLevel: "HIGH",
    recommendation: "HOLD FOR SECONDARY VERIFICATION",
    status: "Flagged",
    timestamp: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
    reasons: [
      "Significant photo replacement boundary anomalies detected.",
      "Date of Expiry shows localized compression artifacts and digital manipulation.",
      "Biometric facial match confidence below acceptable threshold (52%)."
    ],
    recommendedAction: "Hold passenger for secondary immigration screening and forensics examination.",
    ocr: {
      fullName: "Elena Rostova",
      documentType: "Passport",
      documentNumber: "P89123450",
      nationality: "Ukrainian",
      dateOfBirth: "22 Nov 1994",
      gender: "Female",
      dateOfIssue: "15 Jan 2019",
      dateOfExpiry: "15 Jan 2029",
      placeOfBirth: "Kyiv, UKR",
      issuingCountry: "UKR"
    },
    checks: [
      { id: "ocr", title: "OCR Extraction", description: "Extracted successfully but checksum anomaly.", status: "warning", score: "84%" },
      { id: "validation", title: "Document Validation", description: "Expiry date format altered.", status: "warning", score: "60%" },
      { id: "tampering", title: "Tampering Analysis", description: "Photo replacement and digital alteration detected.", status: "fail", score: "28%" },
      { id: "face", title: "Face Verification", description: "Significant facial landmark mismatch.", status: "fail", score: "52%" },
      { id: "watchlist", title: "Watchlist Check", description: "Flagged on border checkpoint advisory.", status: "warning", score: "ALERT" }
    ],
    tampering: {
      tamperingScore: 76,
      tamperingRisk: "High",
      indicators: [
        "Photo perimeter contains edge blending and clone stamp artifacts",
        "Expiry date region shows inconsistent JPEG compression grid",
        "MRZ checksum mismatch with visual zone expiry"
      ],
      confidence: 0.91
    },
    faceVerification: {
      similarity: 52,
      status: "Mismatch / Suspect",
      confidence: 0.89
    },
    watchlist: {
      matched: true,
      matchDetails: {
        name: "Elena Rostova",
        riskLevel: "HIGH",
        reason: "Suspicious Document Tampering & Altered Expiry Date"
      }
    }
  },
  {
    id: "VG-2026-10479",
    verificationId: "VG-2026-10479",
    personName: "Michael Brown",
    documentType: "Passport",
    documentNumber: "USA-551029",
    nationality: "American",
    riskScore: 12,
    riskLevel: "LOW",
    recommendation: "PROCEED",
    status: "Verified",
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    reasons: [
      "All primary security checks passed.",
      "No tampering or anomalies found.",
      "High face similarity (98%)."
    ],
    recommendedAction: "Proceed with verification."
  },
  {
    id: "VG-2026-10478",
    verificationId: "VG-2026-10478",
    personName: "Sofia Martinez",
    documentType: "National ID",
    documentNumber: "ES-849201",
    nationality: "Spanish",
    riskScore: 22,
    riskLevel: "LOW",
    recommendation: "PROCEED",
    status: "Verified",
    timestamp: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
    reasons: [
      "Document valid and clean.",
      "Face similarity verified at 94%."
    ],
    recommendedAction: "Proceed with verification."
  },
  {
    id: "VG-2026-10477",
    verificationId: "VG-2026-10477",
    personName: "Tariq Al-Mansoor",
    documentType: "Passport",
    documentNumber: "M90124881",
    nationality: "Syrian",
    riskScore: 92,
    riskLevel: "CRITICAL",
    recommendation: "ESCALATE",
    status: "Flagged",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    reasons: [
      "Match identified against Interpol Red Notice #A-2025-9921.",
      "High tampering score: altered passport number and photo replacement.",
      "Biometric facial discrepancy detected."
    ],
    recommendedAction: "Immediate detention and escalation to Border Police Commander."
  }
];

export const initialCases = [
  {
    id: "CASE-2026-081",
    verificationId: "VG-2026-10480",
    personName: "Elena Rostova",
    documentType: "Passport",
    documentNumber: "P89123450",
    riskScore: 74,
    riskLevel: "HIGH",
    recommendation: "HOLD FOR SECONDARY VERIFICATION",
    status: "Under Review",
    assignedOfficer: "Alex Singh",
    createdTime: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    reasons: [
      "Photo replacement boundary anomalies detected",
      "Expiry date visual zone altered",
      "Watchlist advisory match"
    ],
    evidence: [
      "Forensic image inspection flagged boundary artifacts (Score: 76/100)",
      "Expiry date changed from 2024 to 2029 under optical verification"
    ],
    notes: "Passenger claimed passport was renewed at embassy, but optical inspection confirmed altered laminates."
  },
  {
    id: "CASE-2026-080",
    verificationId: "VG-2026-10477",
    personName: "Tariq Al-Mansoor",
    documentType: "Passport",
    documentNumber: "M90124881",
    riskScore: 92,
    riskLevel: "CRITICAL",
    recommendation: "ESCALATE",
    status: "Escalated",
    assignedOfficer: "Commander V. Rao",
    createdTime: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    reasons: [
      "Interpol Red Notice match #A-2025-9921",
      "Forged identity document",
      "Counterfeit laminate detected"
    ],
    evidence: [
      "Interpol Red Notice active alert confirmed",
      "UV watermark missing in security zone"
    ],
    notes: "Escalated immediately to specialized airport security unit."
  },
  {
    id: "CASE-2026-079",
    verificationId: "VG-2026-10481",
    personName: "Daniel Wilson",
    documentType: "Visa",
    documentNumber: "V-9921048",
    riskScore: 47,
    riskLevel: "MEDIUM",
    recommendation: "MANUAL REVIEW",
    status: "Open",
    assignedOfficer: "Alex Singh",
    createdTime: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    reasons: [
      "Stay duration inconsistency",
      "Minor font variation in authority section"
    ],
    evidence: [
      "Stay duration mismatch between stamp and machine-readable data"
    ],
    notes: "Officer requested passenger to show return flight ticket."
  }
];

export const initialAlerts = [
  {
    id: "ALT-901",
    severity: "High",
    type: "Document Tampering",
    title: "Possible document tampering",
    description: "Visual inconsistency and photo boundary artifact detected in passport photograph region.",
    caseId: "CASE-2026-081",
    verificationId: "VG-2026-10480",
    time: "8 min ago",
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    status: "New"
  },
  {
    id: "ALT-902",
    severity: "Critical",
    type: "Watchlist Match",
    title: "Watchlist match detected",
    description: "Interpol Red Notice match found for passenger Tariq Al-Mansoor (Doc: M90124881).",
    caseId: "CASE-2026-080",
    verificationId: "VG-2026-10477",
    time: "42 min ago",
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    status: "Acknowledged"
  },
  {
    id: "ALT-903",
    severity: "Medium",
    type: "Validation Warning",
    title: "Visa validity requires review",
    description: "Stay duration does not match the extracted visa entry stamp rules.",
    caseId: "CASE-2026-079",
    verificationId: "VG-2026-10481",
    time: "17 min ago",
    timestamp: new Date(Date.now() - 1000 * 60 * 17).toISOString(),
    status: "New"
  }
];

export const initialAuditLogs = [
  {
    id: "AUD-1001",
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    officer: "Alex Singh",
    action: "Verification Completed",
    entity: "Screening",
    entityId: "VG-2026-10482",
    result: "Passed (Risk: 18 - PROCEED)",
    ipAddress: "192.168.1.104"
  },
  {
    id: "AUD-1002",
    timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    officer: "Alex Singh",
    action: "Case Created",
    entity: "Case",
    entityId: "CASE-2026-079",
    result: "Opened for Manual Review",
    ipAddress: "192.168.1.104"
  },
  {
    id: "AUD-1003",
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    officer: "Alex Singh",
    action: "Alert Generated",
    entity: "Alert",
    entityId: "ALT-901",
    result: "High Tampering Risk Triggered",
    ipAddress: "192.168.1.104"
  },
  {
    id: "AUD-1004",
    timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    officer: "Commander V. Rao",
    action: "Case Escalated",
    entity: "Case",
    entityId: "CASE-2026-080",
    result: "Critical Escalation to Police",
    ipAddress: "192.168.1.1"
  }
];

export const initialSettings = {
  weights: {
    ocr: 15,
    validation: 20,
    tampering: 30,
    face: 25,
    watchlist: 10
  },
  thresholds: {
    low: 30,
    medium: 60,
    high: 80
  },
  autoAlertOnHighRisk: true,
  officerName: "Alex Singh",
  officerRole: "Security Officer",
  checkpoint: "Terminal 3 - Immigration Counter 14"
};
