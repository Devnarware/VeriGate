import { useState } from "react";
import {
  ScanLine,
  FileCheck2,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  FolderPlus,
} from "lucide-react";
import DocumentUploader from "../components/screening/DocumentUploader";
import AnalysisProgress from "../components/screening/AnalysisProgress";
import VerificationChecks from "../components/screening/VerificationChecks";
import VerificationResult from "../components/screening/VerificationResult";
import FaceComparisonCard from "../components/screening/FaceComparisonCard";
import TamperingForensicsCard from "../components/screening/TamperingForensicsCard";
import { api } from "../utils/api";

const demoScenarios = [
  {
    id: "scenario-1",
    label: "Scenario 1 — Low Risk",
    docType: "Passport",
    risk: "LOW (Score: 18)",
    outcome: "PROCEED",
    person: "Rahul Sharma (IND)",
    badgeColor: "scenario-low",
  },
  {
    id: "scenario-2",
    label: "Scenario 2 — Medium Risk",
    docType: "Visa",
    risk: "MEDIUM (Score: 47)",
    outcome: "MANUAL REVIEW",
    person: "Daniel Wilson (GBR)",
    badgeColor: "scenario-medium",
  },
  {
    id: "scenario-3",
    label: "Scenario 3 — High Risk",
    docType: "Passport",
    risk: "HIGH (Score: 74)",
    outcome: "HOLD FOR SECONDARY",
    person: "Elena Rostova (UKR)",
    badgeColor: "scenario-high",
  },
  {
    id: "scenario-4",
    label: "Scenario 4 — Critical Risk",
    docType: "Passport",
    risk: "CRITICAL (Score: 92)",
    outcome: "ESCALATE (Watchlist Hit)",
    person: "Tariq Al-Mansoor (SYR)",
    badgeColor: "scenario-critical",
  },
];

export default function Screening() {
  const [file, setFile] = useState(null);
  const [livePhoto, setLivePhoto] = useState(null);
  const [documentType, setDocumentType] = useState("Passport");
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [caseCreated, setCaseCreated] = useState(false);
  const [caseNotification, setCaseNotification] = useState("");

  const handleScenarioSelect = (scenarioId) => {
    const sc = demoScenarios.find((s) => s.id === scenarioId);
    setSelectedScenario(scenarioId);
    if (sc) {
      setDocumentType(sc.docType);
      // Generate a mock file indicator
      const mockFile = new File(["dummy content"], `${sc.person.replace(/\s/g, "_")}_${sc.docType}.jpg`, {
        type: "image/jpeg",
      });
      setFile(mockFile);
    }
  };

  const startAnalysis = async () => {
    if (!file && !selectedScenario) {
      alert("Please upload a document or select an SIH demo scenario.");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setCurrentStep(0);
    setCaseCreated(false);
    setCaseNotification("");

    // Start animated progress steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < 6) return prev + 1;
        return prev;
      });
    }, 450);

    try {
      const formData = new FormData();
      formData.append("documentType", documentType);
      if (selectedScenario) {
        formData.append("scenario", selectedScenario);
      }
      if (file) {
        formData.append("document", file);
      }
      if (livePhoto) {
        formData.append("livePhoto", livePhoto);
      }

      const response = await api.analyzeScreening(formData);

      // Allow progress steps to smoothly finish
      setTimeout(() => {
        clearInterval(stepInterval);
        setCurrentStep(7);
        setTimeout(() => {
          setIsAnalyzing(false);
          setResult(response.data);
        }, 300);
      }, 2400);
    } catch (err) {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      alert(`Screening analysis error: ${err.message || "Failed to reach backend server."}`);
    }
  };

  const handleCreateCase = async () => {
    if (!result) return;
    try {
      const casePayload = {
        verificationId: result.verificationId,
        personName: result.personName,
        documentType: result.documentType,
        documentNumber: result.documentNumber,
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        recommendation: result.recommendation,
        reasons: result.reasons,
        evidence: [
          `Verification ID: ${result.verificationId}`,
          `Tampering score: ${result.tampering?.tamperingScore || 0}/100`,
          `Face similarity: ${result.faceVerification?.similarity || 0}%`,
          result.watchlist?.matched ? `Watchlist Alert: ${result.watchlist.summary}` : "Watchlist clear",
        ],
        notes: `Automated case created by Officer from screening decision ${result.recommendation}.`,
        assignedOfficer: "Alex Singh",
      };

      const res = await api.createCase(casePayload);
      setCaseCreated(true);
      setCaseNotification(`Case ${res.data?.id || "created"} logged successfully in Case Management.`);
    } catch (err) {
      alert(`Could not create case: ${err.message}`);
    }
  };

  const handleEscalate = async () => {
    await handleCreateCase();
    alert("ALERT DISPATCHED: Escalation notified to Airport Border Commander & Police Unit.");
  };

  const resetScreening = () => {
    setFile(null);
    setLivePhoto(null);
    setSelectedScenario(null);
    setResult(null);
    setIsAnalyzing(false);
    setCurrentStep(0);
    setCaseCreated(false);
    setCaseNotification("");
  };

  return (
    <div className="screening-page">
      {/* PAGE HEADER */}
      <section className="page-heading">
        <div>
          <span className="eyebrow">IDENTITY & TRAVEL DOCUMENT SCREENING</span>
          <h1>Document Screening</h1>
          <p>
            AI-assisted multi-layer verification: OCR, document validation, forensics, face match, and watchlist screening.
          </p>
        </div>

        {result && (
          <button className="secondary-button" onClick={resetScreening}>
            <RotateCcw size={15} />
            Start Over
          </button>
        )}
      </section>

      {/* CASE CONFIRMATION BANNER */}
      {caseNotification && (
        <div className="notification-banner success">
          <CheckCircle2 size={16} />
          <span>{caseNotification}</span>
        </div>
      )}

      {/* SCREENING PROCESS */}
      <div className="screening-layout">
        <div className="screening-main">
          {!isAnalyzing && !result && (
            <>
              {/* SIH DEMO SCENARIO SELECTOR */}
              <div className="screening-card demo-scenarios-card">
                <div className="screening-section-header">
                  <div>
                    <div className="flex-title-row">
                      <Sparkles size={16} className="text-primary" />
                      <h2>Deterministic SIH 2026 Demo Scenarios</h2>
                    </div>
                    <p>Load pre-configured test documents for zero-risk hackathon demonstration.</p>
                  </div>
                </div>

                <div className="demo-scenarios-grid">
                  {demoScenarios.map((sc) => (
                    <button
                      key={sc.id}
                      type="button"
                      className={`demo-scenario-btn ${selectedScenario === sc.id ? "active" : ""}`}
                      onClick={() => handleScenarioSelect(sc.id)}
                    >
                      <div className="scenario-btn-top">
                        <span className="scenario-label">{sc.label}</span>
                        <span className={`scenario-pill ${sc.badgeColor}`}>{sc.outcome}</span>
                      </div>
                      <strong className="scenario-person">{sc.person}</strong>
                      <span className="scenario-detail">
                        {sc.docType} · Risk: {sc.risk}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* DOCUMENT TYPE */}
              <div className="screening-card">
                <div className="screening-section-header">
                  <div>
                    <h2>Choose Document Type</h2>
                    <p>Select the identity or travel credential type presented by the traveler.</p>
                  </div>
                </div>

                <div className="document-types">
                  {["Passport", "Visa", "National ID", "Driving License", "Permit"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`document-type ${documentType === type ? "selected" : ""}`}
                      onClick={() => setDocumentType(type)}
                    >
                      <FileCheck2 size={18} />
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* UPLOADER */}
              <div className="screening-card">
                <DocumentUploader onFileSelect={setFile} />
              </div>

              {/* OPTIONAL PRESENTED PERSON LIVE PHOTO */}
              <div className="screening-card optional-live-card">
                <div className="screening-section-header">
                  <div>
                    <h2>Presented Person Photograph (Optional)</h2>
                    <p>Provide traveler live portrait for 1:1 biometric comparison. If omitted, biometric check reports UNVERIFIED.</p>
                  </div>
                  <span className="category-pill">Biometrics</span>
                </div>

                <div className="live-photo-upload-row">
                  <input
                    type="file"
                    id="live-photo-input"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={(e) => setLivePhoto(e.target.files?.[0] || null)}
                    hidden
                  />
                  {!livePhoto ? (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => document.getElementById("live-photo-input")?.click()}
                    >
                      <User size={15} /> Select Presented Person Photo
                    </button>
                  ) : (
                    <div className="selected-live-photo">
                      <CheckCircle2 size={16} className="text-success" />
                      <span>{livePhoto.name}</span>
                      <button
                        type="button"
                        className="remove-file-sm"
                        onClick={() => setLivePhoto(null)}
                        title="Remove live photo"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <small className="muted text-xs">Optional: tests genuine face match / mismatch</small>
                </div>
              </div>

              {/* START BUTTON */}
              <div className="screening-action">
                <button
                  className="primary-button analyze-button"
                  onClick={startAnalysis}
                  disabled={!file && !selectedScenario}
                >
                  <ScanLine size={17} />
                  Start Verification
                </button>

                <span>
                  {selectedScenario
                    ? "SIH Demo Scenario loaded. Click to run explainable AI pipeline."
                    : "Upload credential or select an SIH scenario to begin."}
                </span>
              </div>
            </>
          )}

          {/* ANALYSIS IN PROGRESS */}
          {isAnalyzing && (
            <div className="screening-card">
              <AnalysisProgress currentStep={currentStep} />
            </div>
          )}

          {/* RESULT STATE */}
          {result && (
            <>
              {/* FLAGSHIP VERIFICATION DECISION PANEL */}
              <VerificationResult
                verificationId={result.verificationId}
                riskScore={result.riskScore}
                riskLevel={result.riskLevel}
                recommendation={result.recommendation}
                reasons={result.reasons}
                recommendedAction={result.recommendedAction}
                onNewScreening={resetScreening}
                onCreateCase={handleCreateCase}
                onEscalate={handleEscalate}
              />

              {/* INDIVIDUAL VERIFICATION CHECKS */}
              <div className="screening-card result-checks-card">
                <VerificationChecks checks={result.checks || []} />
              </div>

              {/* OCR EXTRACTED INFORMATION GRID */}
              <div className="screening-card">
                <div className="screening-section-header">
                  <div>
                    <h2>Extracted Document Attributes (OCR)</h2>
                    <p>Structured identity fields extracted with optical character recognition & MRZ parsing.</p>
                  </div>
                  <span className="ocr-confidence-badge">
                    Confidence: {Math.round((result.ocr?.confidence || 0.95) * 100)}%
                  </span>
                </div>

                <div className="ocr-grid">
                  {Object.entries(result.ocr || {})
                    .filter(
                      ([key]) =>
                        !["confidence", "fieldsDetected", "extractionTimeMs", "sourceFile", "mrz"].includes(key)
                    )
                    .map(([label, value]) => (
                      <div className="ocr-field" key={label}>
                        <span>{label.replace(/([A-Z])/g, " $1").trim()}</span>
                        <strong>{String(value)}</strong>
                      </div>
                    ))}
                </div>

                {result.ocr?.mrz && (
                  <div className="mrz-raw-block">
                    <span className="mrz-label">Machine Readable Zone (ICAO Doc 9303 MRZ):</span>
                    <pre>{result.ocr.mrz}</pre>
                  </div>
                )}
              </div>

              {/* TAMPERING FORENSICS CARD */}
              <TamperingForensicsCard tamperingData={result.tampering} />

              {/* BIOMETRIC FACE VERIFICATION CARD */}
              <FaceComparisonCard faceData={result.faceVerification} />

              {/* WATCHLIST RESULT CARD */}
              <div className={`screening-card watchlist-result-card ${result.watchlist?.matched ? "alert" : "clear"}`}>
                <div className="screening-section-header">
                  <div>
                    <h2>Prototype Watchlist Clearance</h2>
                    <p>Screened against simulated border security databases and Interpol advisories.</p>
                  </div>
                  <span className={`watchlist-status-pill ${result.watchlist?.matched ? "alert" : "clear"}`}>
                    {result.watchlist?.matched ? "WATCHLIST MATCH DETECTED" : "CLEAR — NO MATCH"}
                  </span>
                </div>

                <div className="watchlist-result-body">
                  {result.watchlist?.matched ? (
                    <div className="watchlist-match-info">
                      <AlertTriangle size={18} className="text-danger" />
                      <div>
                        <strong>{result.watchlist.matchDetails?.name}</strong>
                        <p>{result.watchlist.summary}</p>
                        <small>Source: {result.watchlist.matchDetails?.source} · Status: ACTIVE</small>
                      </div>
                    </div>
                  ) : (
                    <div className="watchlist-clean-info">
                      <CheckCircle2 size={18} className="text-success" />
                      <p>Subject and document number are clean across all international watchlists.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="screening-info">
          <div className="info-card">
            <div className="info-card-icon">
              <ShieldAlert size={19} />
            </div>

            <h3>How VeriGate Works</h3>
            <p>
              Rather than a binary "fake" or "real" label, VeriGate runs an explainable 5-layer screening pipeline:
            </p>

            <div className="info-list">
              <div>
                <span>01</span>
                <strong>OCR Extraction</strong>
                <small>Parses names, dates, numbers, MRZ</small>
              </div>

              <div>
                <span>02</span>
                <strong>Document Rules</strong>
                <small>Validates expiry, formats, chronology</small>
              </div>

              <div>
                <span>03</span>
                <strong>Tampering Forensics</strong>
                <small>Inspects photo boundaries, fonts, ELA</small>
              </div>

              <div>
                <span>04</span>
                <strong>Biometric Face Match</strong>
                <small>1:1 facial landmark comparison</small>
              </div>

              <div>
                <span>05</span>
                <strong>Decision Engine</strong>
                <small>Synthesizes actionable recommendation</small>
              </div>
            </div>
          </div>

          <div className="privacy-card">
            <User size={18} />
            <div>
              <strong>Privacy-First Verification</strong>
              <p>
                Prototype handles identity attributes in accordance with border control privacy guidelines.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}