# VeriGate — AI Service

Python + FastAPI microservice responsible for OCR extraction, document validation,
tampering detection, face verification, and risk-feature generation. Called by the
backend over REST (WebSocket support reserved for future live-screening use cases).

## Structure
- `app/api/` — FastAPI route modules (one per capability).
- `app/services/` — thin service layer between routes and pipelines.
- `app/pipelines/` — the core AI/CV logic, split into:
  - `ocr_pipeline/` — document classification, preprocessing, field extraction.
  - `tampering_pipeline/` — photo manipulation detection, stamp analysis, metadata analysis.
  - `face_pipeline/` — face detection and face comparison.
  - `risk_pipeline/` — risk feature generation and scoring engine.
- `app/schemas/` — Pydantic request/response schemas.
- `app/utils/` — shared helpers.
- `models/` — placeholder for trained model weights (not included).
- `tests/` — unit tests for each pipeline.

## Design intent
This service is intentionally isolated behind a REST boundary so it can be replaced
or upgraded independently of the frontend and backend.

## Status
Structure-only scaffold. No AI/ML code has been implemented yet.
