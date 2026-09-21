import {
  ShieldCheck,
  ScanLine,
  ArrowRight,
  UploadCloud,
  FileCheck2,
  Cpu,
  Eye,
  Lock,
  AlertCircle,
  FileSearch,
  CheckCircle2,
  Sliders,
  FolderLock,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="landing-container">
      {/* FLOATING TOP PILL NAV (MiniFolio Style) */}
      <nav className="floating-pill-nav" aria-label="Main Navigation">
        <div className="nav-pill-brand">
          <div className="nav-brand-icon">
            <ShieldCheck size={18} />
          </div>
          <span className="nav-brand-title">VeriGate</span>
        </div>

        <div className="nav-pill-actions">
          <Link to="/scan" className="nav-pill-button">
            <span>Start Scanning</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="minifolio-hero">
        <div className="hero-eyebrow-pill">
          <ShieldCheck size={13} />
          <span>Honest & Privacy-Conscious Identity Screening</span>
        </div>

        <h1 className="hero-headline">
          <span className="headline-dark">Screen documents.</span>
          <span className="headline-orange">Store nothing.</span>
        </h1>

        <p className="hero-description">
          An editorial, browser-first identity document screening and forensic inspector.
          Your sensitive credentials never touch persistent external storage, safeguarding
          privacy while highlighting digital tampering.
        </p>

        <div className="hero-actions-row">
          <Link to="/scan" className="pill-btn pill-btn-primary">
            <ScanLine size={17} />
            <span>Start Scanning</span>
            <ArrowRight size={15} />
          </Link>
          <a href="#how-it-works" className="pill-btn pill-btn-secondary">
            <span>How It Works</span>
          </a>
        </div>
      </section>

      {/* HOW VERIGATE WORKS (MiniFolio 3-Card Process) */}
      <section id="how-it-works" className="minifolio-section">
        <div className="section-header-center">
          <span className="section-badge">PROCESS</span>
          <h2 className="section-title">How VeriGate Works</h2>
          <p className="section-subtitle">
            From upload to forensic audit, everything happens in a few simple steps right in memory.
          </p>
        </div>

        <div className="process-cards-grid">
          {/* Card 1: Upload */}
          <div className="process-card">
            <div className="card-mockup-area upload-mockup">
              <div className="dashed-drop-box">
                <div className="drop-icon-circle">
                  <UploadCloud size={20} />
                </div>
                <strong className="drop-title">Choose file or drag & drop</strong>
                <span className="drop-hint">Passport, ID Card, Driver License</span>
              </div>
              <div className="mockup-file-tags">
                <span className="file-chip active">WEBP</span>
                <span className="file-chip">PNG</span>
                <span className="file-chip">JPG</span>
                <span className="file-limit">Max 10 MB</span>
              </div>
            </div>
            <div className="process-card-content">
              <h3>Upload your document</h3>
              <p>
                Submit an identity document image. Optionally supply a selfie for local pixel
                face comparison heuristics.
              </p>
            </div>
          </div>

          {/* Card 2: Forensics (MiniFolio Signature Orange Card) */}
          <div className="process-card">
            <div className="card-mockup-area orange-folder-mockup">
              <div className="folder-inner-content">
                <div className="folder-top-row">
                  <div className="folder-label-group">
                    <Sliders size={18} />
                    <strong>Forensic Engine</strong>
                  </div>
                  <span className="folder-pill-tag">3 Signals</span>
                </div>
                <div className="folder-checks-list">
                  <div className="folder-check-item">
                    <span className="check-bullet">✓</span>
                    <span>Modulus 10 ICAO Checksums</span>
                  </div>
                  <div className="folder-check-item">
                    <span className="check-bullet">✓</span>
                    <span>Error Level Analysis (ELA)</span>
                  </div>
                  <div className="folder-check-item">
                    <span className="check-bullet">✓</span>
                    <span>Laplacian Edge Variance</span>
                  </div>
                </div>
                <div className="folder-bottom-tag">
                  <span>IN-MEMORY SECURE PIPELINE</span>
                </div>
              </div>
            </div>
            <div className="process-card-content">
              <h3>Run forensic analysis</h3>
              <p>
                Our engine extracts optical text, parses MRZ check digits, and performs
                compression forensics simultaneously.
              </p>
            </div>
          </div>

          {/* Card 3: Explainable Verdict */}
          <div className="process-card">
            <div className="card-mockup-area summary-mockup">
              <div className="summary-header-row">
                <span className="summary-title">Audit Overview</span>
                <span className="summary-score">PASS (98%)</span>
              </div>
              <div className="summary-progress-bars">
                <div className="summary-bar-group">
                  <div className="bar-labels">
                    <span>MRZ Checksums</span>
                    <strong className="text-success">Valid</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill fill-green" style={{ width: "100%" }}></div>
                  </div>
                </div>
                <div className="summary-bar-group">
                  <div className="bar-labels">
                    <span>Compression ELA</span>
                    <strong className="text-success">Clean</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill fill-orange" style={{ width: "85%" }}></div>
                  </div>
                </div>
                <div className="summary-bar-group">
                  <div className="bar-labels">
                    <span>Server Retention</span>
                    <strong className="text-neutral">0 KB Saved</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill fill-dark" style={{ width: "0%" }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="process-card-content">
              <h3>Receive an explainable audit</h3>
              <p>
                Inspect an explainable breakdown of verified data, potential anomaly flags,
                and documented physical boundaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES */}
      <section className="minifolio-section alt-surface">
        <div className="section-header-center">
          <span className="section-badge">CAPABILITIES</span>
          <h2 className="section-title">What the System Evaluates</h2>
          <p className="section-subtitle">
            VeriGate provides clear, evidence-based signals without overclaiming physical authenticity.
          </p>
        </div>

        <div className="capabilities-grid">
          <div className="capability-card">
            <div className="capability-icon">
              <FileSearch size={20} />
            </div>
            <h4>OCR & MRZ Extraction</h4>
            <p>
              Parses Machine Readable Zones (TD1 and TD3) and extracts visible fields in
              compliance with ICAO Doc 9303 specifications.
            </p>
          </div>

          <div className="capability-card">
            <div className="capability-icon">
              <CheckCircle2 size={20} />
            </div>
            <h4>Modulus 10 Checksums</h4>
            <p>
              Validates weighted (7-3-1) check digits across document numbers, birth dates,
              expiry dates, and composite hashes.
            </p>
          </div>

          <div className="capability-card">
            <div className="capability-icon">
              <Eye size={20} />
            </div>
            <h4>Error Level Analysis (ELA)</h4>
            <p>
              Measures digital compression error rates across image blocks to identify
              potential digital splicing and clone stamping.
            </p>
          </div>

          <div className="capability-card">
            <div className="capability-icon">
              <Cpu size={20} />
            </div>
            <h4>Synthetic & Texture Checks</h4>
            <p>
              Computes Laplacian edge variance to detect abnormally smoothed, synthetic,
              or AI-generated document images.
            </p>
          </div>
        </div>
      </section>

      {/* PRIVACY & ZERO RETENTION BANNER */}
      <section className="minifolio-section">
        <div className="privacy-highlight-card">
          <div className="privacy-highlight-icon">
            <FolderLock size={28} />
          </div>
          <div className="privacy-highlight-text">
            <h3>Zero Document Retention Guaranteed</h3>
            <p>
              Identity documents are processed ephemerally in volatile memory and immediately
              purged upon request completion. VeriGate maintains no identity database, retains no
              image copies, and executes zero external cloud calls.
            </p>
          </div>
        </div>
      </section>

      {/* LIMITATIONS DISCLOSURE */}
      <section className="minifolio-section limitations-wrap">
        <div className="limitations-editorial-box">
          <div className="limitations-title-row">
            <AlertCircle size={18} />
            <h3>Important Verification Boundaries</h3>
          </div>
          <div className="limitations-editorial-grid">
            <div className="limitation-item">
              <strong>Heuristic Indicators:</strong>
              <span>
                Optical character validation and Error Level Analysis provide heuristic flags
                of digital tampering. They cannot definitively prove physical document authenticity.
              </span>
            </div>
            <div className="limitation-item">
              <strong>Physical Security Elements:</strong>
              <span>
                Holograms, micro-engraving, tactile intaglio ink, and ePassport NFC chip
                cryptographic signatures require physical hardware and cannot be verified from a 2D image.
              </span>
            </div>
            <div className="limitation-item">
              <strong>Facial Comparison:</strong>
              <span>
                Local face matching provides lightweight pixel similarity for demo purposes,
                not biometric-grade 3D liveness or law enforcement recognition.
              </span>
            </div>
            <div className="limitation-item">
              <strong>Datastore Scope:</strong>
              <span>
                Watchlist screenings operate solely against a local prototype testing fixture and
                do not query government, Interpol, or external databases.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* EDITORIAL FOOTER */}
      <footer className="minifolio-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <ShieldCheck size={16} />
            <span>VeriGate Screening & Forensics</span>
          </div>
          <p className="footer-copyright">
            Privacy-first identity document screening. No documents stored.
          </p>
          <div className="footer-links">
            <Link to="/scan" className="footer-link">
              Scan Document
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}