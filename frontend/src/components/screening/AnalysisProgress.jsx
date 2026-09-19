import {
  FileSearch,
  ShieldCheck,
  ScanLine,
  UserRoundCheck,
  Search,
  Activity,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const steps = [
  {
    id: "ocr",
    label: "OCR & MRZ Extraction",
    description: "Parsing visual identity fields & ICAO Doc 9303 MRZ",
    icon: FileSearch,
  },
  {
    id: "validation",
    label: "Document Validation",
    description: "Evaluating Modulus-10 checksums & date consistency",
    icon: ShieldCheck,
  },
  {
    id: "tampering",
    label: "Tampering Forensics",
    description: "Running Error Level Analysis (ELA) for digital manipulation",
    icon: ScanLine,
  },
  {
    id: "synthetic",
    label: "Synthetic & Edge Analysis",
    description: "Measuring Laplacian edge variance & texture uniformity",
    icon: Activity,
  },
  {
    id: "face",
    label: "Face Comparison",
    description: "Evaluating pixel luminance similarity against comparison photo",
    icon: UserRoundCheck,
  },
  {
    id: "watchlist",
    label: "Prototype Watchlist Check",
    description: "Screening against local prototype test records",
    icon: Search,
  },
  {
    id: "decision",
    label: "Decision Synthesis",
    description: "Calculating multi-signal risk & explainable directives",
    icon: CheckCircle2,
  },
];

export default function AnalysisProgress({ currentStep = 0 }) {
  return (
    <div className="analysis-progress">
      <div className="screening-section-header">
        <div>
          <h2>Screening in Progress</h2>
          <p>Analyzing document image through VeriGate's multi-signal pipeline.</p>
        </div>
        <div className="processing-indicator">
          <Loader2 size={18} className="spin-icon" />
          <span>Processing Optical & Forensic Signals...</span>
        </div>
      </div>

      <div className="analysis-steps">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const completed = currentStep > index;
          const active = currentStep === index;

          return (
            <div
              key={step.id}
              className={`analysis-step ${active ? "active" : ""} ${completed ? "completed" : ""}`}
            >
              <div className="step-icon">
                {active ? <Loader2 size={16} className="spin-icon" /> : <Icon size={16} />}
              </div>

              <div className="step-content">
                <strong>{step.label}</strong>
                <span>{step.description}</span>
              </div>

              {active && <div className="step-processing">Analyzing...</div>}
              {completed && <div className="step-complete">Completed</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}