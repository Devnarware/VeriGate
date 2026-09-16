import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  FolderPlus,
  AlertOctagon,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function VerificationResult({
  verificationId,
  riskScore,
  riskLevel,
  recommendation,
  reasons = [],
  recommendedAction,
  onNewScreening,
  onCreateCase,
  onEscalate,
}) {
  const level = (riskLevel || "LOW").toUpperCase();
  const isLow = level === "LOW";
  const isMedium = level === "MEDIUM";
  const isHigh = level === "HIGH";
  const isCritical = level === "CRITICAL";

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
          <span className="decision-eyebrow">VERIFICATION DECISION PANEL</span>
          <div className="decision-title-row">
            <h2>{recommendation}</h2>
            <span className={badgeClass}>{level} RISK</span>
          </div>
          <p className="decision-subtitle">
            {isLow
              ? "All primary signals verified successfully. Document and identity are consistent."
              : isMedium
              ? "Discrepancy detected in document attributes. Officer manual review required."
              : isHigh
              ? "Elevated tampering or identity mismatch indicators. Hold subject for secondary inspection."
              : "Critical risk detected: security alert match or severe document forgery. Escalate immediately."}
          </p>
        </div>

        <div className="decision-score-box">
          <div className="score-circle">
            <strong>{riskScore}</strong>
            <span>/100</span>
          </div>
          <small>Composite Risk Score</small>
        </div>
      </div>

      <div className="decision-divider"></div>

      <div className="decision-body-grid">
        <div className="decision-reasons-block">
          <span className="section-mini-label">WHY THIS DECISION? (EXPLAINABLE SIGNALS)</span>
          <ul className="decision-reasons-list">
            {reasons.map((reason, index) => {
              const isPass = reason.includes("✓") || reason.toLowerCase().includes("pass") || reason.toLowerCase().includes("no match") || reason.toLowerCase().includes("strong") || reason.toLowerCase().includes("success");
              return (
                <li key={index} className={isPass ? "reason-pass" : "reason-flag"}>
                  {isPass ? (
                    <CheckCircle2 size={15} className="reason-icon-pass" />
                  ) : (
                    <AlertTriangle size={15} className="reason-icon-warn" />
                  )}
                  <span>{reason.replace(/^[✓⚠]\s*/, "")}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="decision-action-block">
          <span className="section-mini-label">RECOMMENDED OFFICER ACTION</span>
          <div className="action-card-callout">
            <Icon size={20} />
            <p>{recommendedAction || "Proceed with standard processing."}</p>
          </div>

          <div className="decision-cta-group">
            <button
              type="button"
              className="primary-button"
              onClick={onCreateCase}
              title="Create official investigation case"
            >
              <FolderPlus size={15} />
              Create Case
            </button>

            {(isHigh || isCritical) && (
              <button
                type="button"
                className="escalate-button"
                onClick={onEscalate}
                title="Escalate directly to Border Commander"
              >
                <AlertOctagon size={15} />
                Escalate Alert
              </button>
            )}

            <button
              type="button"
              className="secondary-button"
              onClick={onNewScreening}
              title="Start another document screening"
            >
              New Screening
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="decision-footer-meta">
        <span>Verification ID: {verificationId || "VG-2026-PENDING"}</span>
        <span>Screening completed just now · Authorized Officer: Alex Singh</span>
      </div>
    </div>
  );
}