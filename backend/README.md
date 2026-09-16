# VeriGate — Backend

Node.js + Express.js REST API that serves the frontend and orchestrates calls to
the Python AI service for OCR, validation, tampering detection, face verification,
and risk scoring.

## Structure
- `config/` — environment and database configuration.
- `controllers/` — request handlers, one module per domain (auth, users, documents,
  screening, OCR, validation, tampering, face verification, risk scoring, cases,
  alerts, watchlist, reports, audit logs).
- `middleware/` — auth, error handling, file upload, and request validation.
- `models/` — MongoDB/Mongoose schemas.
- `routes/` — Express route definitions, aggregated in `routes/index.js`.
- `services/` — business logic, including the client used to call the AI service.
- `utils/` — shared helper functions.
- `uploads/` — temporary storage for uploaded documents (gitignored).
- `logs/` — application/audit logs (gitignored).

## Status
Structure-only scaffold. No application code has been implemented yet.
