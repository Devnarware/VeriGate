import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MinusCircle,
  Info,
} from "lucide-react";

function CheckIcon({ status }) {
  if (status === "pass") {
    return <CheckCircle2 size={17} className="text-success" />;
  }
  if (status === "warning") {
    return <AlertTriangle size={17} className="text-warning" />;
  }
  if (status === "fail") {
    return <XCircle size={17} className="text-danger" />;
  }
  return <MinusCircle size={17} className="text-neutral" />;
}

export default function VerificationChecks({ checks = [] }) {
  if (!checks || checks.length === 0) return null;

  return (
    <div className="verification-checks">
      <div className="screening-section-header">
        <div>
          <h2>Verification Signals Breakdown</h2>
          <p>
            Signal evaluation and forensic observations. Each check indicates specific findings and documented limits.
          </p>
        </div>
      </div>

      <div className="checks-grid">
        {checks.map((check) => {
          const statusClass = (check.status || "neutral").toLowerCase();
          return (
            <div className={`verification-check ${statusClass}`} key={check.id}>
              <div className="check-main-row">
                <div className="check-icon">
                  <CheckIcon status={check.status} />
                </div>

                <div className="check-content">
                  <div className="check-title-row">
                    <strong>{check.title}</strong>
                    <span className={`check-status-tag ${statusClass}`}>
                      {check.status === "not_available" ? "NOT AVAILABLE" : check.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="check-description">{check.description}</p>
                </div>

                <div className="check-score">
                  <span>{check.score}</span>
                </div>
              </div>

              {check.note && (
                <div className="check-limit-note">
                  <Info size={13} />
                  <span>{check.note}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
