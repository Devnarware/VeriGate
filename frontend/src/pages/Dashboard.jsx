import {
  ScanLine,
  Shield,
  FileCheck2,
  Cpu,
  Lock,
  ArrowRight,
  Eye,
  AlertCircle,
  FileSearch,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="landing-page">
      {/* HERO SECTION */}
      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-pill">
            <Shield size={14} />
            <span>Honest & Privacy-Conscious Identity Screening</span>
          </div>

          <h1 className="hero-title">
            Transparent Document Screening & Forensic Analysis
          </h1>

          <p className="hero-subtitle">
            Perform instant optical text extraction, ICAO Doc 9303 MRZ checksum validation,
            and heuristic image forensics — with zero persistent document storage.
          </p>

          <div className="hero-cta-group">
            <Link to="/scan" className="primary-hero-button">
              <ScanLine size={18} />
              <span>Scan a Document</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="landing-section">
        <div className="section-intro">
          <span className="section-eyebrow">SCREENING PIPELINE</span>
          <h2>How VeriGate Analyzes Documents</h2>
          <p>
            An explainable, multi-signal pipeline that evaluates structured data and visual heuristics.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon-wrapper">
              <ScanLine size={24} />
            </div>
            <h3>Upload Image</h3>
            <p>
              Submit an identity document image (JPG, PNG, WEBP) and optionally a live photo for
              heuristic visual comparison.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon-wrapper">
              <Cpu size={24} />
            </div>
            <h3>Multi-Signal Analysis</h3>
            <p>
              The engine performs optical text recognition, ICAO 9303 MRZ check digit validation,
              Error Level Analysis (ELA), and edge-variance checks.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon-wrapper">
              <FileCheck2 size={24} />
            </div>
            <h3>Transparent Assessment</h3>
            <p>
              Review a categorized breakdown of verified signals, detected anomalies, and clear
              explanations with documented limitations.
            </p>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES & REAL CHECKS */}
      <section className="landing-section alt-bg">
        <div className="section-intro">
          <span className="section-eyebrow">CAPABILITIES</span>
          <h2>What the System Evaluates</h2>
          <p>
            VeriGate is designed to provide clear, actionable signals without overclaiming authenticity.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FileSearch size={22} />
            </div>
            <h4>OCR & MRZ Extraction</h4>
            <p>
              Extracts visible identity fields and parses 2-line (TD3) or 3-line (TD1) Machine
              Readable Zones according to ICAO Doc 9303 specifications.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <CheckCircle2 size={22} />
            </div>
            <h4>Mathematical Checksum Validation</h4>
            <p>
              Verifies modulus 10 (weight 7-3-1) check digits on document numbers, birth dates,
              expiry dates, and composite checksums.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Eye size={22} />
            </div>
            <h4>Error Level Analysis (ELA)</h4>
            <p>
              Highlights digital compression discrepancies across image regions to identify
              potential digital splicing or text alterations.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Cpu size={22} />
            </div>
            <h4>Synthetic & Texture Heuristics</h4>
            <p>
              Calculates Laplacian edge variance and texture uniformity indicators to flag
              potential computer-generated or template-rendered images.
            </p>
          </div>
        </div>
      </section>

      {/* PRIVACY & TRANSPARENCY SECTION */}
      <section className="landing-section">
        <div className="privacy-card-banner">
          <div className="privacy-banner-icon">
            <Lock size={32} />
          </div>
          <div className="privacy-banner-text">
            <h3>Privacy-Conscious Architecture</h3>
            <p>
              <strong>Zero Document Retention:</strong> Uploaded identity documents are held only in
              temporary storage during analysis and immediately deleted from disk upon completion.
              VeriGate stores no persistent image copies, no identity database, and makes no external cloud API calls.
            </p>
          </div>
        </div>
      </section>

      {/* LIMITATIONS & DISCLAIMER */}
      <section className="landing-section limitations-section">
        <div className="limitations-box">
          <div className="limitations-header">
            <AlertCircle size={20} />
            <h3>Important Verification Limitations</h3>
          </div>
          <ul className="limitations-list">
            <li>
              <strong>Heuristic Indicators:</strong> Optical analysis and Error Level Analysis
              provide heuristic indicators of potential digital alteration; they cannot definitively
              prove or disprove physical document authenticity.
            </li>
            <li>
              <strong>Physical Security Features:</strong> Holograms, microprinting, UV fluorescence,
              tactile intaglio ink, and electronic chip (ePassport) cryptographic signatures cannot
              be verified from a standard 2D digital image and require physical examination hardware.
            </li>
            <li>
              <strong>Facial Comparison:</strong> Face comparison in VeriGate is a lightweight pixel
              similarity heuristic for local demo assistance — it is not biometric-grade 3D facial recognition.
            </li>
            <li>
              <strong>Watchlist Scope:</strong> Watchlist screening operates strictly against a local
              prototype testing datastore and is not connected to any government, Interpol, or law
              enforcement records.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}