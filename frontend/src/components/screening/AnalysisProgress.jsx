import {
  FileSearch,
  ShieldCheck,
  ScanLine,
  UserRoundCheck,
  Search,
  Activity,
  CheckCircle2,
  Check,
} from "lucide-react";

const steps = [
  {
    id: "ocr",
    label: "OCR Extraction",
    description: "Reading structured document fields",
    icon: FileSearch,
  },
  {
    id: "validation",
    label: "Document Validation",
    description: "Checking validity, expiry & rules",
    icon: ShieldCheck,
  },
  {
    id: "tampering",
    label: "Tampering Forensics",
    description: "Inspecting visual anomalies & compression",
    icon: ScanLine,
  },
  {
    id: "face",
    label: "Face Verification",
    description: "Comparing document photo with live face",
    icon: UserRoundCheck,
  },
  {
    id: "watchlist",
    label: "Watchlist Check",
    description: "Screening against security alerts",
    icon: Search,
  },
  {
    id: "risk",
    label: "Risk Assessment",
    description: "Evaluating weighted multi-signal engine",
    icon: Activity,
  },
  {
    id: "decision",
    label: "Decision Support",
    description: "Synthesizing explainable recommendation",
    icon: CheckCircle2,
  },
];

export default function AnalysisProgress({ currentStep }) {
  return (
    <div className="analysis-progress">
      <div className="screening-section-header">
        <div>
          <h2>Verification in Progress</h2>
          <p>VeriGate multi-layer pipeline analyzing document across 7 independent security signals.</p>
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
                {completed ? <Check size={17} /> : <Icon size={17} />}
              </div>

              <div className="step-content">
                <strong>{step.label}</strong>
                <span>{step.description}</span>
              </div>

              {active && <div className="step-processing">Analyzing...</div>}
              {completed && <div className="step-complete">Verified</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}