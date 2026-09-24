import { useState } from "react";
import {
  ScanLine,
  FileCheck2,
  Shield,
  RotateCcw,
  AlertTriangle,
  User,
  CheckCircle2,
  Lock,
  Info,
} from "lucide-react";
import DocumentUploader from "../components/screening/DocumentUploader";
import AnalysisProgress from "../components/screening/AnalysisProgress";
import VerificationChecks from "../components/screening/VerificationChecks";
import VerificationResult from "../components/screening/VerificationResult";
import FaceComparisonCard from "../components/screening/FaceComparisonCard";
import TamperingForensicsCard from "../components/screening/TamperingForensicsCard";
import { api } from "../utils/api";

export default function Screening() {
  const [file, setFile] = useState(null);
  const [livePhoto, setLivePhoto] = useState(null);
  const [documentType, setDocumentType] = useState("Passport");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const startAnalysis = async () => {
    if (!file) {
      setError("Please upload an identity document image to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    setCurrentStep(0);

    // Dynamic progress step advancement during processing
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => (prev < 6 ? prev + 1 : prev));
    }, 900);

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("documentType", documentType);
      if (livePhoto) {
        formData.append("livePhoto", livePhoto);
      }

      const response = await api.analyzeScreening(formData);
      clearInterval(stepTimer);
      setCurrentStep(6);

      if (response && response.success && response.data) {
        setResult(response.data);
      } else {
        throw new Error(response?.message || "Verification failed to complete.");
      }
    } catch (err) {
      clearInterval(stepTimer);
      console.error("Screening analysis error:", err);
      setError(
        err.message ||
          "An error occurred while processing the document. Please ensure the image is clear and try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScreening = () => {
    setFile(null);
    setLivePhoto(null);
    setResult(null);
    setError(null);
    setCurrentStep(0);
  };

  return (
    <div className="screening-page">
      {/* PAGE HEADING */}
      <section className="page-heading">
        <div>
          <span className="eyebrow">DOCUMENT SCREENING & VERIFICATION</span>
          <h1>Optical & Forensic Document Analysis</h1>
          <p>
            Automated text extraction, ICAO 9303 checksum verification, Error Level Analysis (ELA),
            and multi-signal risk assessment.
          </p>
        </div>
      </section>

      {/* ERROR BANNER */}
      {error && (
        <div className="notification-banner error">
          <AlertTriangle size={18} />
          <div className="banner-content">
            <strong>Screening Error</strong>
            <span>{error}</span>
          </div>
          <button type="button" className="retry-btn" onClick={resetScreening}>
            <RotateCcw size={14} /> Try Another Document
          </button>
        </div>
      )}

      {/* SCREENING PROCESS */}
      <div className="screening-layout">
        <div className="screening-main">
          {!isAnalyzing && !result && (
            <>
              {/* DOCUMENT TYPE SELECTOR */}
              <div className="screening-card">
                <div className="screening-section-header">
                  <div>
                    <h2>1. Select Document Type</h2>
                    <p>Specify the credential format for targeted field and rule parsing.</p>
                  </div>
                </div>

                <div className="document-types">
                  {["Passport", "Visa", "National ID"].map((type) => (
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

              {/* PRIMARY DOCUMENT UPLOADER */}
              <div className="screening-card">
                <div className="screening-section-header">
                  <div>
                    <h2>2. Upload Document Image</h2>
                    <p>High-resolution front image showing visual text and Machine Readable Zone (MRZ).</p>
                  </div>
                </div>
                <DocumentUploader
                  label="Document"
                  acceptText="JPG, PNG, WEBP · Max 5 MB"
                  onFileSelect={(selected) => {
                    setFile(selected);
                    if (error) setError(null);
                  }}
                />
              </div>

              {/* OPTIONAL LIVE / COMPARISON PHOTO */}
              <div className="screening-card optional-live-card">
                <div className="screening-section-header">
                  <div>
                    <h2>3. Comparison Photograph (Optional)</h2>
                    <p>
                      Provide a separate selfie or portrait for 1:1 pixel luminance similarity comparison.
                    </p>
                  </div>
                  <span className="category-pill">Optional</span>
                </div>

                <div className="live-photo-upload-row">
                  <input
                    type="file"
                    id="live-photo-input"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={(e) => setLivePhoto(e.target.files?.[0] || null)}
                    hidden
                  />
                  {!livePhoto ? (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => document.getElementById("live-photo-input")?.click()}
                    >
                      <User size={15} /> Select Comparison Photo
                    </button>
                  ) : (
                    <div className="selected-live-photo">
                      <CheckCircle2 size={16} className="text-success" />
                      <span>{livePhoto.name}</span>
                      <button
                        type="button"
                        className="remove-file-sm"
                        onClick={() => setLivePhoto(null)}
                        title="Remove comparison photo"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <small className="muted-hint">
                  If omitted, face verification check will simply be recorded as NOT AVAILABLE.
                </small>
              </div>

              {/* START ANALYSIS ACTION */}
              <div className="screening-action">
                <button
                  className="primary-hero-button analyze-button"
                  onClick={startAnalysis}
                  disabled={!file}
                >
                  <ScanLine size={18} />
                  <span>Analyze Document</span>
                </button>

                <span className="action-hint">
                  {file
                    ? `Ready to analyze ${file.name}`
                    : "Upload a document image to enable verification."}
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

          {/* RESULTS VIEW */}
          {result && (
            <>
              {/* PRIMARY DECISION SUMMARY */}
              <VerificationResult
                verificationId={result.verificationId}
                riskScore={result.riskScore}
                riskLevel={result.riskLevel}
                recommendation={result.recommendation}
                reasons={result.reasons}
                recommendedAction={result.recommendedAction}
                onNewScreening={resetScreening}
              />

              {/* VERIFICATION SIGNALS BREAKDOWN */}
              <div className="screening-card result-checks-card">
                <VerificationChecks checks={result.checks || []} />
              </div>

              {/* EXTRACTED ATTRIBUTES CARD */}
              <div className="screening-card">
                <div className="screening-section-header">
                  <div>
                    <h2>Extracted Document Attributes (OCR)</h2>
                    <p>Identity attributes extracted from optical character recognition and MRZ parsing.</p>
                  </div>
                  <span className="ocr-confidence-badge">
                    Extraction Confidence: {Math.round((result.ocr?.confidence || 0) * 100)}%
                  </span>
                </div>

                <div className="ocr-grid">
                  {Object.entries(result.ocr || {})
                    .filter(
                      ([key, val]) =>
                        !["confidence", "fieldsDetected", "extractionTimeMs", "mrz", "ocrStatus"].includes(key) &&
                        val !== null &&
                        val !== undefined &&
                        typeof val !== "object"
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
                    <span className="mrz-label">Machine Readable Zone (ICAO Doc 9303):</span>
                    <pre>{result.ocr.mrz}</pre>
                  </div>
                )}

                <div className="limitation-footnote">
                  <Info size={13} />
                  <span>
                    <strong>OCR Legibility Note:</strong> Successful OCR extraction verifies text
                    readability, not the validity or legal standing of the presented credential.
                  </span>
                </div>
              </div>

              {/* TAMPERING & SYNTHETIC FORENSICS */}
              <TamperingForensicsCard
                tamperingData={result.tampering}
                syntheticData={result.synthetic}
              />

              {/* FACE COMPARISON */}
              <FaceComparisonCard faceData={result.faceVerification} />

              {/* WATCHLIST CLEARANCE */}
              <div
                className={`screening-card watchlist-result-card ${
                  result.watchlist?.matched ? "alert" : "clear"
                }`}
              >
                <div className="screening-section-header">
                  <div>
                    <h2>Prototype Watchlist Check</h2>
                    <p>Comparison against local prototype test database (5 test records).</p>
                  </div>
                  <span
                    className={`watchlist-status-pill ${
                      result.watchlist?.matched ? "alert" : "clear"
                    }`}
                  >
                    {result.watchlist?.matched ? "PROTOTYPE MATCH" : "NO LOCAL MATCH"}
                  </span>
                </div>

                <div className="watchlist-result-body">
                  {result.watchlist?.matched ? (
                    <div className="watchlist-match-info">
                      <AlertTriangle size={18} className="text-danger" />
                      <div>
                        <strong>{result.watchlist.matchDetails?.name}</strong>
                        <p>{result.watchlist.summary}</p>
                        <small>
                          Source: {result.watchlist.matchDetails?.source} · Flag:{" "}
                          {result.watchlist.matchDetails?.reason}
                        </small>
                      </div>
                    </div>
                  ) : (
                    <div className="watchlist-clean-info">
                      <CheckCircle2 size={18} className="text-success" />
                      <p>{result.watchlist?.summary || "No matches found in local prototype watchlist."}</p>
                    </div>
                  )}
                </div>

                <div className="limitation-footnote">
                  <Info size={13} />
                  <span>
                    <strong>Scope Note:</strong> This check only searches a local test table. It is NOT connected to Interpol, national criminal registries, or border authorities.
                  </span>
                </div>
              </div>

              {/* BOTTOM SCAN ANOTHER BUTTON */}
              <div className="bottom-reset-row">
                <button type="button" className="primary-hero-button" onClick={resetScreening}>
                  <RotateCcw size={16} />
                  <span>Scan Another Document</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* RIGHT SIDEBAR / SYSTEM OVERVIEW */}
        <aside className="screening-info">
          <div className="info-card">
            <div className="info-card-icon">
              <Shield size={20} />
            </div>
            <h3>Pipeline Signals</h3>
            <p>VeriGate assesses document authenticity across multiple transparent layers:</p>

            <div className="info-list">
              <div>
                <span>01</span>
                <strong>Optical Text Extraction</strong>
                <small>Tesseract.js engine extracts identity attributes</small>
              </div>

              <div>
                <span>02</span>
                <strong>ICAO Doc 9303 MRZ Checksums</strong>
                <small>Validates 7-3-1 modulus-10 check digits</small>
              </div>

              <div>
                <span>03</span>
                <strong>ELA & Copy-Move Cloning</strong>
                <small>Scans for JPEG inconsistencies & cloned patches</small>
              </div>

              <div>
                <span>04</span>
                <strong>Synthetic Edge Variance</strong>
                <small>Measures Laplacian sharpness & texture</small>
              </div>

              <div>
                <span>05</span>
                <strong>Biometric Face Profile</strong>
                <small>Structural geometry & quadrant luminance vectors</small>
              </div>

              <div>
                <span>06</span>
                <strong>Watchlist Screening</strong>
                <small>Simulated Interpol SLTD & ICAO 9303 checks</small>
              </div>
            </div>
          </div>

          <div className="privacy-card">
            <Lock size={18} />
            <div>
              <strong>Zero Data Retention</strong>
              <p>
                All files uploaded during this session are processed in temporary memory/disk and
                automatically deleted upon completion.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}