import { User, CheckCircle2, AlertTriangle, UserX, Info } from "lucide-react";

export default function FaceComparisonCard({ faceData }) {
  if (!faceData) return null;

  const {
    similarity = null,
    status = "NOT PROVIDED",
    assessment = "No live comparison photo provided.",
    isProvided = false,
    limitations = "Heuristic comparison only — not biometric-grade facial recognition.",
  } = faceData;

  const notProvided = !isProvided || status === "NOT PROVIDED" || status === "NOT_AVAILABLE";
  const isMatch = !notProvided && similarity !== null && similarity >= 80;
  const isModerate = !notProvided && similarity !== null && similarity >= 60 && similarity < 80;

  return (
    <div className="screening-card face-comparison-card">
      <div className="screening-section-header">
        <div>
          <h2>Visual Face Comparison (Heuristic)</h2>
          <p>Pixel luminance similarity comparison between document portrait and optional comparison photo.</p>
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
            <span className="photo-label">Document Photo</span>
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
              {notProvided ? "Live Photo (Not Provided)" : "Comparison Photo"}
            </span>
          </div>
        </div>
      </div>

      <div className="face-metrics-bar">
        <div className="metric-col">
          <span>Comparison Status</span>
          <strong
            className={
              notProvided ? "text-neutral" : isMatch ? "text-success" : isModerate ? "text-warning" : "text-danger"
            }
          >
            {notProvided ? "NOT CONDUCTED" : status}
          </strong>
        </div>

        <div className="metric-col">
          <span>Similarity Index</span>
          <strong>{notProvided ? "N/A" : `${similarity}%`}</strong>
        </div>

        <div className="metric-col">
          <span>Methodology</span>
          <strong>Pixel Luminance (64×64)</strong>
        </div>
      </div>

      <div className="face-assessment-box">
        {notProvided ? (
          <Info size={16} className="text-neutral" />
        ) : isMatch ? (
          <CheckCircle2 size={16} className="text-success" />
        ) : (
          <AlertTriangle size={16} className="text-warning" />
        )}
        <p>{assessment}</p>
      </div>

      <div className="limitation-footnote">
        <Info size={13} />
        <span>
          <strong>Methodology Note:</strong> {limitations} Does not measure 3D depth, liveness, or active anti-spoofing.
        </span>
      </div>
    </div>
  );
}
