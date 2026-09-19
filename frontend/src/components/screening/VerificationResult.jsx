import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  AlertOctagon,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

export default function VerificationResult({
  verificationId,
  riskScore = 0,
  riskLevel = "LOW",
  recommendation = "DOCUMENT REVIEW REQUIRED",
  reasons = [],
  recommendedAction,
  onNewScreening,
}) {
  const level = (riskLevel || "LOW").toUpperCase();
  const isLow = level === "LOW";
  const isMedium = level === "MEDIUM";
  const isHigh = level === "HIGH";

  const Icon = isLow
    ? ShieldCheck
    : isMedium
    ? AlertTriangle
    : isHigh
    ? ShieldAlert
    : AlertOctagon;

  const badgeClass = isLow
    ? "decision-badge low"
    : isMedium
    ? "decision-badge medium"
    : isHigh
    ? "decision-badge high"
    : "decision-badge critical";

  return (
    <div className={`verification-result decision-panel-container ${level.toLowerCase()}`}>
      <div className="decision-panel-top">
        <div className="decision-header-info">
          <span className="decision-eyebrow">VERIFICATION ASSESSMENT SUMMARY</span>
          <div className="decision-title-row">
            <h2>{recommendation}</h2>
            <span className={badgeClass}>{level} RISK</span>
          </div>
          <p className="decision-subtitle">
            {isLow
              ? "All analyzed optical and checksum signals are consistent with expected standards."
              : isMedium
              ? "Inconsistencies or low-confidence extractions detected. Manual inspection recommended."
              : isHigh
              ? "Elevated tampering or identity attribute anomalies detected. Manual review required."
              : "Critical risk signals detected: local watchlist match or severe data invalidity."}
          </p>
        </div>

        <div className="decision-score-box">
          <div className="score-circle">
            <strong>{riskScore}</strong>
            <span>/100</span>
          </div>
          <small>Weighted Risk Score</small>
        </div>
      </div>

      <div className="decision-divider"></div>

      <div className="decision-body-grid">
        <div className="decision-reasons-block">
          <span className="section-mini-label">PRIMARY CONTRIBUTING SIGNALS</span>
          <ul className="decision-reasons-list">
            {reasons.map((reason, index) => {
              const isPass =
                reason.includes("✓") ||
                reason.toLowerCase().includes("pass") ||
                reason.toLowerCase().includes("no match") ||
                reason.toLowerCase().includes("clear") ||
                reason.toLowerCase().includes("valid") ||
                reason.toLowerCase().includes("clean");

              return (
                <li key={index} className={isPass ? "reason-pass" : "reason-flag"}>
                  {isPass ? (
                    <CheckCircle2 size={16} className="reason-icon-pass" />
                  ) : (
                    <AlertTriangle size={16} className="reason-icon-warn" />
                  )}
                  <span>{reason.replace(/^[✓⚠]\s*/, "")}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="decision-action-block">
          <span className="section-mini-label">RECOMMENDED NEXT ACTION</span>
          <div className="action-card-callout">
            <Icon size={22} />
            <p>{recommendedAction || "Review document details."}</p>
          </div>

          <div className="decision-cta-group">
            <button
              type="button"
              className="primary-hero-button"
              onClick={onNewScreening}
              title="Screen another identity document"
            >
              <RotateCcw size={16} />
              <span>Scan Another Document</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="decision-footer-meta">
        <span>Verification ID: {verificationId || "VG-PENDING"}</span>
        <span>Screening completed locally · No document image retained</span>
      </div>
    </div>
  );
}