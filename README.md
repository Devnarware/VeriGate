# VeriGate — AI-Powered Identity & Document Screening Platform

**Smart India Hackathon 2026 — Problem Statement SIH26188**  
*AI-Based Fake Identity & Document Screening System*

> *"AI-assisted identity verification for faster and safer document screening."*

---

## 1. Executive Summary & SIH Problem Statement

At border checkpoints, airports, immigration counters, and secure identity check environments, immigration officers process tens of thousands of travelers and credentials daily. Fraudulent, altered, expired, or manipulated identity documents present severe national security risks:

- Counterfeit passports, visas, and national IDs
- Digitally or physically altered dates of birth and validity dates
- Manipulated document photographs and clone-stamp edge blending
- Identity impersonation and multiple synthetic identities
- Active Interpol / border watchlist matches
- Inconsistencies between machine-readable zones (MRZ) and visual inspection zones
- High manual verification latency causing checkpoint queues and human inspection errors

### VeriGate's Core Innovation: Explainable Decision Support

Unlike primitive systems that only output a binary *"Document is fake"* or *"Document is valid"*, **VeriGate** provides an explainable, multi-layer verification framework. It itemizes:
1. **What was checked** (OCR extraction, document validity rules, image forensics, 1:1 biometric face match, and watchlist intelligence).
2. **What passed & what failed**.
3. **What looks suspicious and why** (specific forensic indicators such as localized compression anomalies, font variations, or MRZ check digit discrepancies).
4. **Calculated Composite Risk Score** (0–100) and **Risk Level** (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
5. **Actionable Recommendation** (`PROCEED`, `MANUAL REVIEW`, `HOLD FOR SECONDARY VERIFICATION`, `ESCALATE`).
6. **Recommended Officer Directive** ("What the officer should do next").

The final decision remains with the authorized officer, augmented by AI transparency.

---

## 2. Architecture & Pipeline

```
                    TRAVELER / OFFICER
                           │
                           ▼
             REACT + VITE FRONTEND (PORT 5173)
                           │
                           │ REST (multipart/form-data & JSON)
                           ▼
             NODE.JS + EXPRESS BACKEND (PORT 5000)
                           │
          ┌────────────────┼────────────────────────┐
          │                │                        │
          ▼                ▼                        ▼
     OCR SERVICE    VALIDATION RULES         AI SERVICES
     - Passport     - Expiry chronology      ┌──────┴──────┐
     - Visa         - Check digit checksums  ▼             ▼
     - National ID  - Cross-field coherence FORENSICS   FACE MATCH
     - License      - ICAO 9303 standards    (ELA, Font,  (1:1 Landmark
     - Permit                                 Stamps)      Similarity)
          │                │                        │
          └────────────────┼────────────────────────┘
                           ▼
                  WEIGHTED RISK ENGINE
             (Configurable Multi-Signal Weights)
                           ▼
              VERIFICATION DECISION ENGINE
        (PROCEED / REVIEW / SECONDARY / ESCALATE)
                           ▼
              PROTOTYPE WATCHLIST SCREENING
                           │
                           ▼
          PERSISTENCE LAYER (DUAL-MODE STORE)
        (MongoDB Support + Embedded Resilient DataStore)
                           │
          ┌────────────────┼────────────────────────┐
          ▼                ▼                        ▼
      DASHBOARD     CASES / ALERTS / AUDIT     REPORTS & ANALYTICS
```

---

## 3. Core Modules Implemented

| # | Module | Capabilities |
|---|---|---|
| **A** | **OCR Extraction** | Supports Passport, Visa, National ID, Driving License, Permit. Structured extraction of names, document numbers, dates, nationality, issuing country, and ICAO 9303 MRZ data via Tesseract.js. |
| **B** | **Document Validation** | Date chronology, expiration relative to current date, required field verification, and ICAO Doc 9303 7-3-1 modulus-10 check digit verification with multiple failure tracking. |
| **C** | **Tampering Forensics** | Optical image analysis, Error Level Analysis (ELA) block variance, editing metadata scanning (Photoshop, GIMP, Canva), photo boundary inspection, and stamp validity. |
| **D** | **Synthetic Document Detection** | Laplacian edge variance distribution ($\sigma_{\text{edge}}$), substrate texture uniformity across quadrants, ICAO ID-3/ID-1 aspect ratio geometry compliance, and AI generator metadata/prompt markers. |
| **E** | **Face Verification** | 1:1 biometric comparison between document portrait and live presented traveler photograph using 64x64 pixel luminance matrix Euclidean distance heuristic. |
| **F** | **Risk Scoring Engine** | Configurable multi-signal weighted scoring: OCR (10%), Validation (25%), Tampering (20%), Synthetic Detection (15%), Face (20%), Watchlist (10%). Protected by non-dilution severe threat floors. |
| **G** | **Decision Engine** | Generates explainable decisions (`PROCEED`, `MANUAL REVIEW`, `HOLD FOR SECONDARY`, `ESCALATE`), itemized reasons, and recommended officer directives. |
| **H** | **Case Management** | Full dossier tracking with statuses (`Open`, `Under Review`, `Escalated`, `Resolved`, `Rejected`, `Closed`), evidence logs, officer assignment, and search filters. |
| **I** | **Alert Management** | Real-time threat alerts (`Critical`, `High`, `Medium`) with live acknowledgment and resolution workflows. |
| **J** | **Prototype Watchlist** | Border intelligence simulator for Interpol Red Notices and security advisories. Real-time name and document number lookup. |
| **K** | **Verification History** | Searchable audit ledger of all historical screenings with full dossier modal inspection. |
| **L** | **Risk Analytics** | Operational dashboard utilizing Recharts for daily trends, clearance rates, risk distributions, and anomaly patterns. |
| **M** | **Reports Generator** | Daily Screening Summaries, Incident Audits, and Forensic Digests with interactive printable PDF preview and export. |
| **N** | **Audit Trail** | Automatic logging of every screening event, case creation, status update, alert acknowledgment, and system query. |
| **O** | **System Settings** | Interactive sliders to configure risk signal weights, threshold cutoffs, officer profile, and live service health monitoring. |

---

### Non-Dilution Threat Floors (Addressing AI/Synthetic Credential Forgery)
In real-world border operations, a catastrophic failure in one verification domain must not be diluted into a "LOW" risk score by clean signals in other domains. VeriGate enforces strict monotonic threat floors:
- **Rule 1 (Confirmed Watchlist Hit)**: Risk Floor $\ge 92 \rightarrow$ `CRITICAL`
- **Rule 2 (Multiple MRZ Checksum Failures $\ge 2$)**: Risk Floor $\ge 85 \rightarrow$ `CRITICAL`
- **Rule 3 (Single MRZ Checksum Failure)**: Risk Floor $\ge 65 \rightarrow$ `HIGH`
- **Rule 4 (High Synthetic Suspicion $\ge 70$)**: Risk Floor $\ge 70 \rightarrow$ `HIGH`
- **Rule 5 (Compound Multi-Vector Fraud)**: Risk Floor $\ge 90 \rightarrow$ `CRITICAL`
- **Rule 6 (Biometric Face Mismatch)**: Risk Floor $\ge 65 \rightarrow$ `HIGH`
- **Rule 7 (Expired Travel Credential)**: Risk Floor $\ge 55 \rightarrow$ `MEDIUM-HIGH`
- **Rule 8 (Severe Tampering $\ge 60$ / $\ge 80$)**: Risk Floor $\ge 65 / 85 \rightarrow$ `HIGH / CRITICAL`

---

## 4. Deterministic SIH Demo Scenarios

To ensure a seamless, reliable demonstration for hackathon evaluators without reliance on external network connectivity, VeriGate includes 4 pre-configured deterministic scenarios:

| Scenario | Credential & Subject | Risk Score | Risk Level | Recommendation | Key Findings & Explanations |
|---|---|---|---|---|---|
| **Scenario 1** | **Clean Indian Passport**<br>Rahul Sharma | **18 / 100** | `LOW` | **PROCEED** | All security checks pass; OCR attributes clean; 96% biometric face match; zero tampering traces; clear across all watchlists. |
| **Scenario 2** | **Visa Inconsistency**<br>Daniel Wilson (UK) | **47 / 100** | `MEDIUM` | **MANUAL REVIEW** | Stay duration mismatch (90 days requested vs 30 days visa entry stamp); minor font variance in issuing authority region; 68% face similarity. |
| **Scenario 3** | **Altered Passport**<br>Elena Rostova (UKR) | **74 / 100** | `HIGH` | **HOLD FOR SECONDARY** | Localized ELA compression anomaly on date of expiry (altered from 2024 to 2029); photo boundary edge blending; 52% face mismatch; MRZ checksum discrepancy. |
| **Scenario 4** | **Interpol Hit & Forged ID**<br>Tariq Al-Mansoor (SYR) | **92 / 100** | `CRITICAL` | **ESCALATE** | Match against Interpol Red Notice #A-2025-9921; digital text overlay on document number; physical photo replacement; 38% face mismatch. Immediate detention alert. |

---

## 5. Technology Stack

- **Frontend**: React 19, Vite, React Router v7, Lucide React icons, Recharts data visualizations.
- **Backend API**: Node.js v24, Express.js REST API, Multer multipart upload parser, Morgan logger, Dotenv.
- **Data Persistence**: Dual-mode DataStore (supports MongoDB when `MONGODB_URI` is provided, with an automatic resilient embedded JSON store in `backend/data/store.json` requiring zero external database configuration).
- **AI Microservice**: Python 3.13, FastAPI (entry point in `ai-service/app/main.py`).

---

## 6. Local Setup & Running Instructions

### Prerequisites
- Node.js (v18 or higher; v24 recommended)
- Python 3.10+ (optional, for FastAPI microservice)
- Modern web browser (Chrome, Edge, Firefox)

### Step 1: Backend Setup
```bash
cd backend
npm install
npm run dev
# Or: node server.js
```
The backend will start at `http://localhost:5000`.  
Verify health by visiting: `http://localhost:5000/api/health`.

### Step 2: Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The frontend will open at `http://localhost:5173`.

### Step 3 (Optional): Python AI Microservice
```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## 7. SIH Evaluator Walkthrough Guide

1. **Dashboard (`/`)**:
   - Inspect today's screening throughput metrics, pending reviews, high-risk flags, and live priority alerts.
   - Click **"Start Screening"** or select **"Document Screening"** from the sidebar.

2. **Document Screening (`/screening`)**:
   - At the top of the page, click on any of the **Deterministic SIH Demo Scenarios** (e.g., *Scenario 1 — Low Risk* or *Scenario 3 — High Risk*), or choose a document type and upload any JPG/PNG/PDF.
   - Click **"Start Verification"**.
   - Observe the 7-stage animated progress pipeline (OCR -> Validation -> Tampering -> Face Match -> Watchlist -> Risk -> Decision).
   - Review the **Verification Decision Panel**:
     - Notice the prominent Risk Score (e.g., 74/100) and Recommendation (`HOLD FOR SECONDARY VERIFICATION`).
     - Review the explainable breakdown of **"Why this decision?"**.
     - Review the **Recommended Officer Action**.
   - Review the **OCR Extracted Fields** and raw ICAO MRZ zone.
   - Inspect the **Tampering & Forgery Forensics** card (Error Level Analysis, font consistency, photo boundary laminate).
   - Inspect the **Biometric Face Verification** card (document portrait vs live camera comparison with % similarity and landmark points).
   - Inspect the **Watchlist Clearance** badge.
   - Click **"Create Case"** to convert the screening result into an active investigation case.

3. **Case Management (`/cases`)**:
   - View newly created and existing cases.
   - Filter by Status (`Open`, `Under Review`, `Escalated`, `Resolved`, `Closed`) or Risk Level (`Low`, `Medium`, `High`, `Critical`).
   - Click **"Review"** to open the full dossier with evidence and update the status to `Under Review`.

4. **Alerts (`/alerts`)**:
   - View prioritized alerts generated from high-risk screenings or watchlist hits.
   - Click **"Acknowledge"** or **"Resolve"** to track officer disposition.

5. **Prototype Watchlist (`/watchlist`)**:
   - Search for watchlisted persons (e.g., search *"Tariq"* or *"Elena"* or document *"M90124881"*).
   - Click **"Add Watchlist Entry"** to simulate adding a new security bulletin.

6. **Analytics (`/analytics`)**:
   - View interactive Recharts visualizations: screening trends, risk distributions, document credential breakdown, and tampering vs biometric mismatch trends.

7. **Reports (`/reports`)**:
   - Click **"Preview"** on any report or **"Generate New Report"**.
   - Use the **"Print / Export PDF"** button to view the official border agency report formatted for law enforcement printing.

8. **Settings (`/settings`)**:
   - Adjust the risk scoring weights (OCR, Validation, Tampering, Face, Watchlist) using interactive sliders.
   - Verify that all system microservices report operational status.

---

## 8. REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health check and microservice status |
| `POST` | `/api/screening/analyze` | Multi-signal document screening (multipart/form-data) |
| `GET` | `/api/screening/history` | Historical screening list with search & risk filters |
| `GET` | `/api/screening/scenarios` | Pre-configured deterministic SIH demo scenarios |
| `GET` | `/api/screening/:id` | Individual screening dossier |
| `GET` | `/api/cases` | List cases with status and risk filters |
| `POST` | `/api/cases` | Create new investigation case |
| `GET` | `/api/cases/:id` | Get case details |
| `PATCH` | `/api/cases/:id` | Update case status, notes, or assigned officer |
| `GET` | `/api/alerts` | List security alerts |
| `PATCH` | `/api/alerts/:id` | Update alert status (New, Acknowledged, Resolved) |
| `GET` | `/api/watchlist` | Get all prototype watchlist entries |
| `POST` | `/api/watchlist/search` | Search watchlist by name, document number, nationality |
| `POST` | `/api/watchlist` | Add new watchlist entry |
| `DELETE` | `/api/watchlist/:id` | Remove entry from watchlist |
| `GET` | `/api/analytics` | Statistical KPI metrics and chart distributions |
| `GET` | `/api/reports` | List generated screening reports |
| `POST` | `/api/reports/generate` | Generate custom screening report |
| `GET` | `/api/audit` | Retrieve complete security audit log trail |
| `GET` | `/api/settings` | Get current risk scoring weights and thresholds |
| `POST` | `/api/settings` | Update risk scoring weights and thresholds |

---

## 9. Future AI Integration Roadmap

The prototype architecture is intentionally decoupled so that simulated/heuristic services can be swapped with production deep learning models:

1. **OCR Engine**: Drop-in replacement with [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) or [EasyOCR](https://github.com/JaidedAI/EasyOCR) for multilingual passport text and ICAO Doc 9303 MRZ parsing.
2. **Biometric Face Verification**: Drop-in integration with [InsightFace (ArcFace)](https://github.com/deepinsight/insightface) or FaceNet for sub-millisecond 512-dimensional facial embedding vector comparisons.
3. **Forensic Tampering**: Integration of deep convolutional neural networks (e.g., ManTra-Net, SpliceNet, or patch-based ResNet models) for localized photo replacement boundary detection and JPEG Error Level Analysis (ELA).
4. **Hardware Scanner Integration**: Connecting 3M / Thales document readers with UV and Infrared optical illumination for physical watermark and holographic thread validation.

---

## 10. Privacy & Disclaimer

> **Prototype System Notice**: This software is developed for the Smart India Hackathon 2026 (Problem Statement SIH26188). Verification results are AI-assisted decision support signals intended to aid authorized personnel. No permanent storage of raw biometric credentials is performed.
