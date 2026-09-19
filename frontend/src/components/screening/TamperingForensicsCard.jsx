import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

export default function TamperingForensicsCard({ tamperingData, syntheticData }) {
  if (!tamperingData) return null;

  const {
    tamperingScore = 0,
    tamperingRisk = "Low",
    indicators = [],
  } = tamperingData;

  const isLow = tamperingRisk === "Low";
  const isMedium = tamperingRisk === "Medium";

  const syntheticScore = syntheticData?.syntheticScore ?? 0;
  const syntheticLevel = syntheticData?.suspicionLevel ?? "LOW_SUSPICION";
  const syntheticIndicators = syntheticData?.indicators ?? [];

  return (
    <div className="screening-card forensics-card">
      <div className="screening-section-header">
        <div>
          <h2>Image Forensics & Tampering Indicators</h2>
          <p>Optical compression anomaly scanning (ELA) and edge-variance heuristics.</p>
        </div>
        <div className={`tampering-badge ${isLow ? "low" : isMedium ? "medium" : "high"}`}>
          Tampering Indicator: {tamperingRisk} ({tamperingScore}/100)
        </div>
      </div>

      <div className="forensics-metrics-row">
        <div className="metric-box">
          <span>Error Level Analysis (ELA)</span>
          <strong>{isLow ? "Uniform Quantization" : "Compression Inconsistencies"}</strong>
          <small>Measures resaving artifact distribution</small>
        </div>

        <div className="metric-box">
          <span>Synthetic Detection</span>
          <strong>{syntheticLevel.replace("_", " ")}</strong>
          <small>Laplacian edge variance ({syntheticScore}/100)</small>
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
          <span>No digital compression spikes or synthetic edge patterns detected by heuristic algorithms.</span>
        </div>
      )}

      <div className="limitation-footnote">
        <Info size={13} />
        <span>
          <strong>Forensics Limitation:</strong> Error Level Analysis and Laplacian heuristics evaluate digital compression artifacts and edge sharpness. They cannot verify physical document substrates, UV security threads, holograms, or watermarks.
        </span>
      </div>
    </div>
  );
}
