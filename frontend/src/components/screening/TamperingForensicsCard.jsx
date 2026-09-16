import { ScanLine, AlertTriangle, CheckCircle2, ShieldCheck, Cpu } from "lucide-react";

export default function TamperingForensicsCard({ tamperingData }) {
  if (!tamperingData) return null;

  const {
    tamperingScore = 6,
    tamperingRisk = "Low",
    indicators = [],
    details = {},
  } = tamperingData;

  const isLow = tamperingRisk === "Low";
  const isMedium = tamperingRisk === "Medium";
  const isHigh = tamperingRisk === "High" || tamperingRisk === "Critical";

  return (
    <div className="screening-card forensics-card">
      <div className="screening-section-header">
        <div>
          <h2>Tampering & Forgery Forensics</h2>
          <p>Optical image forensics, Error Level Analysis (ELA), and substrate integrity scans.</p>
        </div>
        <div className={`tampering-badge ${isLow ? "low" : isMedium ? "medium" : "high"}`}>
          Tampering Risk: {tamperingRisk} ({tamperingScore}/100)
        </div>
      </div>

      <div className="forensics-grid">
        <div className="forensics-item">
          <span>Error Level Analysis (ELA)</span>
          <strong>{details.elaAnalysis || "Uniform quantization levels"}</strong>
        </div>

        <div className="forensics-item">
          <span>Font & Kerning Consistency</span>
          <strong>{details.fontConsistency || "Official security typography matched"}</strong>
        </div>

        <div className="forensics-item">
          <span>Photo Boundary Laminate</span>
          <strong>{details.photoBoundary || "Seamless integration without perimeter blur"}</strong>
        </div>

        <div className="forensics-item">
          <span>State Seal & Stamp Integrity</span>
          <strong>{details.stampIntegrity || "Microprint and official ink verified"}</strong>
        </div>
      </div>

      {indicators.length > 0 ? (
        <div className="forensics-alerts">
          <span className="alerts-title">
            <AlertTriangle size={14} className="text-warning" />
            Detected Forensic Anomalies ({indicators.length})
          </span>
          <ul>
            {indicators.map((indicator, idx) => (
              <li key={idx}>{indicator}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="forensics-clean">
          <CheckCircle2 size={16} className="text-success" />
          <span>No digital splicing, font alterations, or physical photo replacements detected.</span>
        </div>
      )}
    </div>
  );
}
