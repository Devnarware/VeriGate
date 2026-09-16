import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

function CheckIcon({ status }) {
  if (status === "pass") {
    return <CheckCircle2 size={17} />;
  }

  if (status === "warning") {
    return <AlertTriangle size={17} />;
  }

  return <XCircle size={17} />;
}

export default function VerificationChecks({ checks }) {
  return (
    <div className="verification-checks">
      <div className="screening-section-header">
        <div>
          <h2>Verification Checks</h2>
          <p>
            Individual signals contributing to the final assessment.
          </p>
        </div>
      </div>

      <div className="checks-grid">
        {checks.map((check) => (
          <div
            className={`verification-check ${check.status}`}
            key={check.id}
          >
            <div className="check-icon">
              <CheckIcon status={check.status} />
            </div>

            <div className="check-content">
              <strong>{check.title}</strong>
              <span>{check.description}</span>
            </div>

            <div className="check-score">
              {check.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
