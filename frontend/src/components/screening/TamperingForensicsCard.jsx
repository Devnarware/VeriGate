import { AlertTriangle, CheckCircle2, Info, Copy, Layers } from "lucide-react";

export default function TamperingForensicsCard({ tamperingData, syntheticData }) {
  if (!tamperingData) return null;

  const {
    tamperingScore = 0,
    tamperingRisk = "Low",
    indicators = [],
    copyMove = { detected: false, matchedPairs: 0, confidence: 0, regions: [] },
    compressionArtifacts = { uniformityScore: 92, status: "Consistent" },
  } = tamperingData;

  const isLow = tamperingRisk === "Low";
  const isMedium = tamperingRisk === "Medium";

  const syntheticScore = syntheticData?.syntheticScore ?? 0;
  const syntheticLevel = syntheticData?.suspicionLevel ?? "LOW_SUSPICION";
  const syntheticIndicators = syntheticData?.indicators ?? [];

  const copyMoveDetected = copyMove?.detected || false;

  return (
    <div className="screening-card forensics-card">
      <div className="screening-section-header">
        <div>
          <h2>Image Forensics & Tampering Indicators</h2>
          <p>Optical compression anomaly scanning (ELA), copy-move patch correlation, and edge-variance heuristics.</p>
        </div>
        <div className={`tampering-badge ${isLow ? "low" : isMedium ? "medium" : "high"}`}>
          Tampering Indicator: {tamperingRisk} ({tamperingScore}/100)
        </div>
      </div>

      <div className="forensics-metrics-row four-col">
        <div className="metric-box">
          <span>Error Level Analysis (ELA)</span>
          <strong>{isLow ? "Uniform Quantization" : "Compression Anomaly"}</strong>
          <small>Resaving delta variance</small>
        </div>

        <div className={`metric-box ${copyMoveDetected ? "metric-box-alert" : ""}`}>
          <div className="metric-box-label-row">
            <span>Copy-Move Detection</span>
            {copyMoveDetected && <Copy size={12} className="text-danger" />}
          </div>
          <strong className={copyMoveDetected ? "text-danger" : "text-success"}>
            {copyMoveDetected ? `${copyMove.matchedPairs} Cloned Patches` : "No Cloned Regions"}
          </strong>
          <small>{copyMoveDetected ? "Duplicate texture clusters found" : "Block correlation clean"}</small>
        </div>

        <div className="metric-box">
          <span>Compression Artifacts</span>
          <strong>{compressionArtifacts.status || "Consistent"}</strong>
          <small>DCT grid uniformity ({compressionArtifacts.uniformityScore || 92}%)</small>
        </div>

        <div className="metric-box">
          <span>Synthetic Edge Check</span>
          <strong>{syntheticLevel.replace("_", " ")}</strong>
          <small>Laplacian variance ({syntheticScore}/100)</small>
        </div>
      </div>

      {indicators.length > 0 || syntheticIndicators.length > 0 ? (
        <div className="forensics-alerts">
          <span className="alerts-title">
            <AlertTriangle size={15} className="text-warning" />
            Detected Optical Anomalies ({indicators.length + syntheticIndicators.length})
          </span>
          <ul>
            {indicators.map((indicator, idx) => (
              <li key={`tamp-${idx}`}>{indicator}</li>
            ))}
            {syntheticIndicators.map((indicator, idx) => (
              <li key={`synth-${idx}`}>{indicator}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="forensics-clean">
          <CheckCircle2 size={16} className="text-success" />
          <span>No digital compression spikes, duplicated copy-move patches, or synthetic patterns detected by heuristic algorithms.</span>
        </div>
      )}

      <div className="limitation-footnote">
        <Info size={13} />
        <span>
          <strong>Forensics Limitation:</strong> Error Level Analysis and Copy-Move block correlation evaluate digital compression and cloned pixel statistics. They cannot verify physical document substrates, UV security threads, holograms, or watermarks.
        </span>
      </div>
    </div>
  );
}
