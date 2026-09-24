import { User, CheckCircle2, AlertTriangle, UserX, Info, Scan, Shield } from "lucide-react";

export default function FaceComparisonCard({ faceData }) {
  if (!faceData) return null;

  const {
    similarity = null,
    status = "NOT PROVIDED",
    assessment = "No live comparison photo provided.",
    isProvided = false,
    structuralMatch = null,
    eyeRegionMatch = null,
    lowerFaceMatch = null,
    confidence = 0.0,
    landmarksMatched = "N/A",
    faceGeometry = null,
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
          <p>Multi-quadrant facial geometry, eye band profile, and pixel luminance vector similarity.</p>
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
            {faceGeometry?.documentBox && (
              <small className="face-geo-tag">
                {faceGeometry.documentBox.width}x{faceGeometry.documentBox.height}px crop
              </small>
            )}
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
            {faceGeometry?.presentedBox && !notProvided && (
              <small className="face-geo-tag">
                Aspect ratio: {faceGeometry.presentedBox.aspectRatio}
              </small>
            )}
          </div>
        </div>
      </div>

      {/* METRICS & QUADRANT CORRELATION BAR */}
      <div className="face-metrics-bar four-col">
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
          <span>Structural Alignment</span>
          <strong className={structuralMatch && structuralMatch >= 75 ? "text-success" : ""}>
            {notProvided || !structuralMatch ? "N/A" : `${structuralMatch}% Match`}
          </strong>
        </div>

        <div className="metric-col">
          <span>Biometric Confidence</span>
          <strong>{notProvided ? "N/A" : `${Math.round(confidence * 100)}%`}</strong>
        </div>
      </div>

      {/* QUADRANT PROFILE BREAKDOWN (when photo is provided) */}
      {!notProvided && (
        <div className="quadrant-profile-section">
          <div className="quadrant-profile-header">
            <span className="quadrant-title">
              <Scan size={14} />
              <span>Facial Quadrant Correlation Profiler</span>
            </span>
            <span className="quadrant-zones-badge">{landmarksMatched}</span>
          </div>

          <div className="quadrant-bars-row">
            <div className="quadrant-bar-item">
              <div className="bar-labels">
                <span>Eye Band & Interpupillary Vector</span>
                <strong>{eyeRegionMatch || similarity}%</strong>
              </div>
              <div className="bar-track">
                <div
                  className={`bar-fill ${(eyeRegionMatch || similarity) >= 75 ? "fill-green" : "fill-orange"}`}
                  style={{ width: `${eyeRegionMatch || similarity}%` }}
                ></div>
              </div>
            </div>

            <div className="quadrant-bar-item">
              <div className="bar-labels">
                <span>Lower Face & Jawline Profile</span>
                <strong>{lowerFaceMatch || similarity}%</strong>
              </div>
              <div className="bar-track">
                <div
                  className={`bar-fill ${(lowerFaceMatch || similarity) >= 75 ? "fill-green" : "fill-orange"}`}
                  style={{ width: `${lowerFaceMatch || similarity}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

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
