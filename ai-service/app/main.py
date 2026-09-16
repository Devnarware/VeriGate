# main.py
# VeriGate Python AI Microservice (FastAPI) — DEMO / MOCK STANDALONE SERVICE
# IMPORTANT: NOT USED BY LIVE SCREENING PIPELINE (Live pipeline executes locally in Node.js backend)

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uvicorn
import time

app = FastAPI(
    title="VeriGate AI Microservice (DEMO / MOCK)",
    description="Standalone demonstration microservice stub for external Python integration. NOT active in live screening pipeline.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "operational",
        "service": "VeriGate Python Microservice (DEMO / MOCK)",
        "deploymentMode": "STANDALONE_DEMO",
        "isUsedByLivePipeline": False,
        "note": "Production screening runs directly on the Node.js backend using local Tesseract.js and image-forensic heuristics.",
        "timestamp": time.time()
    }

@app.post("/api/ai/analyze")
async def analyze_document(
    document_type: str = Form("Passport"),
    scenario: Optional[str] = Form(None),
    document: Optional[UploadFile] = File(None),
    live_photo: Optional[UploadFile] = File(None)
):
    """
    DEMO STUB: Returns simulated signals for offline testing.
    The primary VeriGate screening pipeline executes in Node.js backend without calling this endpoint.
    """
    return {
        "success": True,
        "service": "VeriGate AI Python Microservice (DEMO / MOCK)",
        "documentType": document_type,
        "scenario": scenario,
        "isMock": True,
        "inferenceTimeMs": 420,
        "aiSignals": {
            "ocrConfidence": 0.98 if scenario != "scenario-4" else 0.78,
            "tamperingScore": 6 if scenario == "scenario-1" else 76 if scenario == "scenario-3" else 89 if scenario == "scenario-4" else 34,
            "faceSimilarity": 96 if scenario == "scenario-1" else 52 if scenario == "scenario-3" else 38 if scenario == "scenario-4" else 68,
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
