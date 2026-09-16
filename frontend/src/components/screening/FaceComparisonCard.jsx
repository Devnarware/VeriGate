import { User, CheckCircle2, AlertTriangle, UserX } from "lucide-react";

export default function FaceComparisonCard({ faceData }) {
  if (!faceData) return null;

  const {
    similarity = null,
    status = "Strong Match",
    landmarksMatched = "68 / 68 Points",
    livenessCheck = "Live Present",
    assessment = "Biometric facial comparison consistent.",
    isProvided = true,
  } = faceData;

  const notProvided = !isProvided || status === "NOT PROVIDED";
  const isMatch = !notProvided && similarity !== null && similarity >= 80;
  const isModerate = !notProvided && similarity !== null && similarity >= 60 && similarity < 80;

  return (
    <div className="screening-card face-comparison-card">
      <div className="screening-section-header">
        <div>
          <h2>Biometric Face Verification</h2>
          <p>1:1 facial comparison between document photo and live traveler presentation.</p>
        </div>
        <div
          className={`similarity-badge ${
            notProvided ? "neutral" : isMatch ? "pass" : isModerate ? "warning" : "fail"
          }`}
        >
          {notProvided ? "NOT PROVIDED" : `${similarity}% Similarity`}
        </div>
      </div>

      <div className="face-comparison-layout">
        <div className="face-photo-slot">
          <div className="face-photo-box">
            <div className="face-avatar-placeholder doc-avatar">
              <User size={38} />
            </div>
            <span className="photo-label">Document Photo (Extracted)</span>
          </div>
        </div>

        <div className="face-vs-badge">
          <span>VS</span>
        </div>

        <div className="face-photo-slot">
          <div className="face-photo-box">
            <div className={`face-avatar-placeholder ${notProvided ? "unprovided-avatar" : "live-avatar"}`}>
              {notProvided ? <UserX size={38} /> : <User size={38} />}
            </div>
            <span className="photo-label">
              {notProvided ? "Live Photo (Not Supplied)" : "Presented Person (Live Camera)"}
            </span>
          </div>
        </div>
      </div>

      <div className="face-metrics-bar">
        <div className="metric-col">
          <span>Match Status</span>
          <strong
            className={
              notProvided ? "text-muted" : isMatch ? "text-success" : isModerate ? "text-warning" : "text-danger"
            }
          >
            {status}
          </strong>
        </div>

        <div className="metric-col">
          <span>Facial Landmarks</span>
          <strong>{notProvided ? "Unverified" : landmarksMatched}</strong>
        </div>

        <div className="metric-col">
          <span>Liveness Confirmation</span>
          <strong>{notProvided ? "Not Conducted" : livenessCheck}</strong>
        </div>
      </div>

      <div className="face-assessment-box">
        {notProvided ? (
          <AlertTriangle size={16} className="text-warning" />
        ) : isMatch ? (
          <CheckCircle2 size={16} className="text-success" />
        ) : (
          <AlertTriangle size={16} className="text-warning" />
        )}
        <p>{assessment}</p>
      </div>
    </div>
  );
}
