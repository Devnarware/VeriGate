# VeriGate — Identity Document Screening & Forensic Analysis

> **A truthful, privacy-conscious document screening and verification platform.**  
> *Developed for automated optical extraction, ICAO Doc 9303 checksum validation, and optical forensic heuristics.*

---

## 1. Product Overview

**VeriGate** provides an explainable, multi-signal verification engine for identity documents (Passports, Visas, and National IDs). Rather than issuing opaque binary judgments or making unverified claims of physical document authenticity, VeriGate decomposes document inspection into verifiable optical, mathematical, and forensic indicators.

### Key Principles

1. **Truthful Signal Classification**: Every signal is clearly categorized as either a **deterministic mathematical check** (e.g., ICAO 9303 modulus-10 checksums) or an **optical heuristic indicator** (e.g., Error Level Analysis, edge variance).
2. **Privacy-Conscious Zero-Retention**: Uploaded document images and comparison photos are held only in temporary storage during processing and **immediately deleted from disk** upon completion. No identity profiles or documents are retained.
3. **Transparent Decision Support**: The platform delivers clear, itemized reasons explaining which signals passed, which were flagged as suspicious, and which were unavailable.
4. **Human-in-the-Loop Directives**: Automated screening assists reviewers by highlighting specific inconsistencies, leaving final administrative or legal judgments to qualified human examiners.

---

## 2. System Architecture

```
                       USER / CLIENT
                             │
                             ▼
             REACT + VITE FRONTEND (PORT 5173)
             - Document & photo uploader
             - Live progress indicator
             - Structured signal breakdown
             - Explainable assessment panel
                             │
                             │ REST (multipart/form-data)
                             ▼
            EXPRESS + NODE.JS BACKEND (PORT 5001)
             - Security headers & CORS allowlist
             - Strict image validation (JPG, PNG, WEBP <= 5MB)
             - Automatic file cleanup in finally block
                             │
     ┌───────────────────────┼────────────────────────┐
     │                       │                        │
     ▼                       ▼                        ▼
OPTICAL EXTRACTION    VALIDATION ENGINE        IMAGE FORENSICS
- Tesseract.js OCR    - Field presence checks  - Error Level Analysis (ELA)
- Visual field regex  - Expiry chronology      - Editing metadata scan
- ICAO Doc 9303 MRZ   - Modulus-10 checksums   - Laplacian edge variance
     │                       │                        │
     └───────────────────────┼────────────────────────┘
                             ▼
               HEURISTIC FACE COMPARISON (OPTIONAL)
               - 64x64 pixel luminance matrix similarity
                             ▼
                PROTOTYPE LOCAL WATCHLIST
                - Local 5-record development test dataset
                             ▼
                WEIGHTED MULTI-SIGNAL RISK ENGINE
                - Configurable weights with threat floors
                             ▼
                EXPLAINABLE DECISION ENGINE
                - Clear recommendations & next actions
```

---

## 3. Verified Capabilities vs. System Limitations

In document verification, transparency regarding technical boundaries is critical for security.

### Real Technical Capabilities

| Module | Methodology | What It Evaluates |
|---|---|---|
| **OCR Extraction** | Tesseract.js (LSTM engine) | Extracts textual attributes (Full Name, Document Number, Nationality, DOB, Expiry Date). |
| **MRZ Parser** | ICAO Doc 9303 standard parser | Parses 2-line (TD3 Passport) and 3-line (TD1 ID) Machine Readable Zones. |
| **Checksum Validation** | Modulus 10, weight 7-3-1 | Validates mathematical check digits on Document Number, Birth Date, Expiry Date, and composite checksum. |
| **Error Level Analysis (ELA)** | Jimp re-compression & diff | Identifies regional JPEG quantization variance caused by localized digital image splicing or text edits. |
| **Synthetic Analysis** | Laplacian edge variance | Calculates edge sharpness distribution and aspect ratio compliance against official standards. |
| **Face Comparison** | Luminance matrix heuristic | Lightweight 64×64 pixel luminance similarity between credential portrait and optional comparison photo. |
| **Risk Engine** | Multi-signal weighted scoring | Weights signals across OCR, validation, tampering, synthetic, face, and watchlist, enforcing threat floors. |

### Documented Limitations & Out-of-Scope Checks

> [!WARNING]
> **What This System Cannot Prove:**
> - **Physical Security Features:** Standard 2D digital image analysis **cannot** verify physical document elements such as optical variable inks (OVI), holographic laminates, ultraviolet (UV) fluorescent threads, intaglio microprinting, or watermarks.
> - **Cryptographic Chips (ePassports):** VeriGate does not interface with contactless smart card readers (NFC) and cannot perform Passive Authentication (PA) or Active Authentication (AA) on ICAO 9303 RFID chips.
> - **Legal Authenticity:** A clean scan indicates that optical fields are legible, checksums match, and no blatant digital compression anomalies were detected. It does not certify that the underlying credential was legitimately issued by a government authority.
> - **Facial Recognition Scope:** The built-in face comparison is an image-similarity heuristic for demonstration and assistive review. It is not biometric-grade 3D facial recognition and lacks active liveness detection.
> - **Watchlist Scope:** The watchlist screening inspects only a local prototype dataset of 5 test records; it is not connected to Interpol, national police, or border authority databases.

---

## 4. Security & Privacy Architecture

- **Zero Document Retention**: All uploaded documents and comparison photos are assigned cryptographically random temporary filenames, processed, and unlinked (`fs.unlinkSync`) in a `finally` block whether verification succeeds or fails.
- **No Public Upload Hosting**: Static serving of the `/uploads` directory is disabled. Uploaded credentials cannot be accessed or downloaded via HTTP URLs.
- **File Type & Size Restrictions**: Uploads are restricted strictly to raster images (`image/jpeg`, `image/png`, `image/webp`) under 5 MB. PDF files are disallowed because optical pipelines require rasterized inputs.
- **PII Protection**: Full raw text extracts are stripped from API responses; only structured, normalized fields required for verification are returned.
- **Origin-Restricted CORS**: Cross-Origin Resource Sharing is locked to configured client origins rather than a wildcard (`*`).
- **Sanitized Error Responses**: Internal file system paths and stack traces are suppressed in API error payloads.

---

## 5. API Reference

### `GET /api/health`
Returns system status and module descriptions.

**Response:**
```json
{
  "success": true,
  "platform": "VeriGate Document Screening Platform",
  "status": "operational",
  "timestamp": "2026-09-19T16:06:18.102Z",
  "uptime": 59,
  "modules": {
    "ocrExtraction": "Tesseract.js OCR & ICAO Doc 9303 MRZ parser",
    "documentValidation": "Rule-based field consistency & expiry validation",
    "tamperingDetection": "Heuristic Error Level Analysis (Jimp)",
    "syntheticDetection": "Heuristic Laplacian edge variance & texture analysis",
    "faceComparison": "Heuristic 64x64 pixel luminance similarity",
    "watchlistScreening": "Local prototype test database",
    "riskEngine": "Multi-signal weighted risk scoring",
    "decisionEngine": "Explainable recommendation engine"
  }
}
```

### `POST /api/screening/analyze`
Analyzes an uploaded identity document and optional live photograph.

**Request:** `multipart/form-data`
- `document` *(required)*: Identity document image file (JPG, PNG, WEBP, max 5 MB).
- `documentType` *(optional)*: Credential format (`Passport`, `Visa`, `National ID`). Default: `Passport`.
- `livePhoto` *(optional)*: Comparison photograph for visual face similarity checking.

**Response:**
```json
{
  "success": true,
  "data": {
    "verificationId": "VG-1789834038606",
    "documentType": "Passport",
    "riskScore": 22,
    "riskLevel": "LOW",
    "recommendation": "PROCEED",
    "reasons": [
      "All required identity attributes successfully extracted.",
      "ICAO Doc 9303 MRZ checksums mathematically validated.",
      "No digital compression or tampering anomalies detected."
    ],
    "recommendedAction": "Document attributes verified consistent. Proceed with standard processing.",
    "processingTimeMs": 340,
    "ocr": {
      "fullName": "JOHN DOE",
      "documentNumber": "A12345678",
      "nationality": "IND",
      "dateOfBirth": "1990-05-14",
      "dateOfExpiry": "2030-05-13",
      "confidence": 0.94,
      "mrz": "P<INNDOE<<JOHN<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\nA123456787IND9005142M3005138<<<<<<<<<<<<<<<2"
    },
    "validation": { "status": "pass", "score": "100%", "checksPerformed": [...] },
    "tampering": { "tamperingScore": 6, "tamperingRisk": "Low", "indicators": [] },
    "synthetic": { "syntheticScore": 12, "suspicionLevel": "LOW_SUSPICION", "indicators": [] },
    "faceVerification": { "isProvided": false, "status": "NOT PROVIDED", "similarity": null },
    "watchlist": { "matched": false, "status": "CLEAR" },
    "checks": [
      { "id": "ocr", "title": "Text Extraction", "status": "pass", "score": "94%", "note": "..." },
      { "id": "validation", "title": "Document Validation", "status": "pass", "score": "100%", "note": "..." },
      { "id": "tampering", "title": "Tampering Indicators", "status": "pass", "score": "94%", "note": "..." },
      { "id": "synthetic", "title": "Synthetic Detection", "status": "pass", "score": "88%", "note": "..." },
      { "id": "face", "title": "Face Comparison", "status": "not_available", "score": "N/A", "note": "..." },
      { "id": "watchlist", "title": "Watchlist Check", "status": "pass", "score": "CLEAR", "note": "..." }
    ]
  }
}
```

---

## 6. Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+)

### Installation

1. **Clone repository:**
   ```bash
   git clone https://github.com/Devnarware/VeriGate.git
   cd VeriGate
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running Locally

1. **Start Backend Server:**
   ```bash
   cd backend
   npm start
   # Server runs on http://localhost:5001
   ```

2. **Start Frontend Dev Server:**
   ```bash
   cd frontend
   npm run dev
   # App runs on http://localhost:5173
   ```

3. **Build Frontend for Production:**
   ```bash
   cd frontend
   npm run build
   ```

4. **Run Linter:**
   ```bash
   cd frontend
   npm run lint
   ```

---

## 7. License & Attribution
VeriGate is developed under the MIT License for transparent, privacy-conscious document screening.
Smart India Hackathon 2026 Reference: `SIH26188`.
