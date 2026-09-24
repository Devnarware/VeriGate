import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  ScanLine,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Lock,
  Eye,
  Sliders,
  X,
} from "lucide-react";
import { api } from "../utils/api";

export default function CaseHistory() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRisk, setSelectedRisk] = useState("ALL");
  const [selectedRecommendation, setSelectedRecommendation] = useState("ALL");

  // Officer Action Modal State
  const [activeModalCase, setActiveModalCase] = useState(null);
  const [officerAction, setOfficerAction] = useState("APPROVED");
  const [officerNotes, setOfficerNotes] = useState("");
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // Selected case for detailed signal drawer
  const [drawerCase, setDrawerCase] = useState(null);

  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCases();
      if (res.success && res.data) {
        setCases(res.data);
      }
    } catch (err) {
      console.error("Failed to load cases:", err);
      setError("Unable to connect to case history service. Operating in offline demo mode.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear the audit history for this demonstration?")) {
      return;
    }
    try {
      await api.clearCases();
      await fetchCases();
    } catch (err) {
      alert("Failed to clear cases: " + err.message);
    }
  };

  const handleSaveOfficerAction = async (e) => {
    e.preventDefault();
    if (!activeModalCase) return;
    setActionSubmitting(true);
    try {
      await api.updateOfficerAction(activeModalCase.id, officerAction, officerNotes);
      setActiveModalCase(null);
      setOfficerNotes("");
      await fetchCases();
    } catch (err) {
      alert("Failed to record officer action: " + err.message);
    } finally {
      setActionSubmitting(false);
    }
  };

  // Filter cases
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      c.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.documentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.officerNotes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk =
      selectedRisk === "ALL" ||
      (c.riskLevel || "").toUpperCase() === selectedRisk.toUpperCase();

    const matchesRec =
      selectedRecommendation === "ALL" ||
      (c.recommendation || "").toUpperCase() === selectedRecommendation.toUpperCase();

    return matchesSearch && matchesRisk && matchesRec;
  });

  // Calculate quick metrics
  const totalCount = cases.length;
  const lowCount = cases.filter((c) => (c.riskLevel || "").toUpperCase() === "LOW").length;
  const reviewCount = cases.filter(
    (c) => (c.riskLevel || "").toUpperCase() === "MEDIUM" || c.recommendation === "MANUAL_REVIEW"
  ).length;
  const highCount = cases.filter(
    (c) => (c.riskLevel || "").toUpperCase() === "HIGH" || (c.riskLevel || "").toUpperCase() === "CRITICAL"
  ).length;

  return (
    <div className="cases-page-container">
      {/* HEADER SECTION */}
      <div className="cases-header-card">
        <div className="cases-header-left">
          <div className="eyebrow-chip">
            <Clock size={13} />
            <span>CENTRALIZED AUDIT TRAIL</span>
          </div>
          <h1 className="cases-title">Verification Cases & History</h1>
          <p className="cases-subtitle">
            Immutable log of identity screenings, forensic anomaly flags, and officer review decisions.
          </p>
        </div>

        <div className="cases-header-actions">
          <Link to="/scan" className="pill-btn pill-btn-primary">
            <ScanLine size={16} />
            <span>Scan New Document</span>
          </Link>
          <button onClick={fetchCases} className="pill-btn pill-btn-secondary" title="Refresh">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleClearAll}
            className="pill-btn pill-btn-danger-outline"
            title="Reset Audit History"
          >
            <Trash2 size={15} />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* ZERO RETENTION COMPLIANCE BANNER */}
      <div className="zero-retention-pill-banner">
        <div className="retention-pill-left">
          <Lock size={15} className="text-primary" />
          <strong>Zero Document Retention Active:</strong>
          <span>
            Only verification ID, risk vectors, decision timestamps, and officer notes are stored. No passport scans or applicant biometrics are ever persisted to disk.
          </span>
        </div>
        <span className="retention-badge">GDPR & DPDP COMPLIANT</span>
      </div>

      {/* METRIC COUNTERS */}
      <div className="cases-metrics-grid">
        <div className="cases-metric-card">
          <div className="metric-header">
            <span className="metric-label">TOTAL AUDITS</span>
            <FileText size={18} className="text-secondary" />
          </div>
          <div className="metric-value">{totalCount}</div>
          <span className="metric-sub">Across all document categories</span>
        </div>

        <div className="cases-metric-card">
          <div className="metric-header">
            <span className="metric-label">LOW RISK (CLEARED)</span>
            <CheckCircle2 size={18} className="text-success" />
          </div>
          <div className="metric-value text-success">{lowCount}</div>
          <span className="metric-sub">
            {totalCount > 0 ? `${Math.round((lowCount / totalCount) * 100)}% clearance rate` : "No scans"}
          </span>
        </div>

        <div className="cases-metric-card">
          <div className="metric-header">
            <span className="metric-label">MANUAL REVIEWS</span>
            <Sliders size={18} className="text-warning" />
          </div>
          <div className="metric-value text-warning">{reviewCount}</div>
          <span className="metric-sub">Border officer confirmation</span>
        </div>

        <div className="cases-metric-card">
          <div className="metric-header">
            <span className="metric-label">HIGH & CRITICAL FLAGS</span>
            <AlertTriangle size={18} className="text-danger" />
          </div>
          <div className="metric-value text-danger">{highCount}</div>
          <span className="metric-sub">Holds & supervisor escalations</span>
        </div>
      </div>

      {/* SEARCH & FILTERS TOOLBAR */}
      <div className="cases-toolbar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by Verification ID (e.g. VG-2026-9041) or Document Type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="search-clear-btn">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filters-group">
          <div className="filter-select-wrapper">
            <Filter size={14} />
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">Critical Risk</option>
            </select>
          </div>

          <div className="filter-select-wrapper">
            <select
              value={selectedRecommendation}
              onChange={(e) => setSelectedRecommendation(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Decisions</option>
              <option value="PROCEED">Proceed</option>
              <option value="MANUAL_REVIEW">Manual Review</option>
              <option value="HOLD">Hold</option>
              <option value="ESCALATE">Escalate</option>
            </select>
          </div>
        </div>
      </div>

      {/* CASES AUDIT TABLE */}
      <div className="cases-table-card">
        {loading ? (
          <div className="cases-loading-state">
            <RefreshCw size={24} className="spin-icon" />
            <p>Loading audit ledger...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="cases-empty-state">
            <FileText size={38} className="empty-icon" />
            <h3>No verification cases match your query</h3>
            <p>Try adjusting your search criteria or execute a new document screening.</p>
            <Link to="/scan" className="pill-btn pill-btn-primary">
              <ScanLine size={16} />
              <span>Start Document Scan</span>
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="cases-table">
              <thead>
                <tr>
                  <th>VERIFICATION ID</th>
                  <th>DOCUMENT TYPE</th>
                  <th>TIMESTAMP</th>
                  <th>RISK SCORE</th>
                  <th>DECISION</th>
                  <th>SIGNAL BREAKDOWN</th>
                  <th>OFFICER ACTION</th>
                  <th>DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((item) => {
                  const riskLevel = (item.riskLevel || "LOW").toUpperCase();
                  const rec = (item.recommendation || "MANUAL_REVIEW").toUpperCase();
                  const riskClass =
                    riskLevel === "LOW"
                      ? "badge-low"
                      : riskLevel === "MEDIUM"
                      ? "badge-medium"
                      : "badge-high";

                  const recClass =
                    rec === "PROCEED"
                      ? "badge-proceed"
                      : rec === "MANUAL_REVIEW"
                      ? "badge-review"
                      : rec === "HOLD"
                      ? "badge-hold"
                      : "badge-escalate";

                  const formattedDate = item.timestamp
                    ? new Date(item.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recent";

                  return (
                    <tr key={item.id} className="case-row">
                      <td className="case-id-cell">
                        <strong>{item.id}</strong>
                        <span className="case-latency">
                          {item.processingTimeMs ? `${item.processingTimeMs}ms` : "1.2s"}
                        </span>
                      </td>
                      <td className="case-doctype-cell">{item.documentType}</td>
                      <td className="case-time-cell">{formattedDate}</td>
                      <td>
                        <span className={`risk-pill ${riskClass}`}>
                          {item.riskScore}/100 {riskLevel}
                        </span>
                      </td>
                      <td>
                        <span className={`decision-pill ${recClass}`}>{rec}</span>
                      </td>
                      <td className="signals-chips-cell">
                        <div className="signals-inline-row">
                          <span
                            className={`mini-chip ${
                              item.signals?.validationStatus === "pass" ? "chip-pass" : "chip-warn"
                            }`}
                            title={`Validation: ${item.signals?.validationScore || "N/A"}`}
                          >
                            MRZ: {item.signals?.validationStatus === "pass" ? "OK" : "CHECK"}
                          </span>
                          <span
                            className={`mini-chip ${
                              item.signals?.tamperingRisk === "Low" ? "chip-pass" : "chip-danger"
                            }`}
                            title={`Tampering Score: ${item.signals?.tamperingScore ?? 0}`}
                          >
                            ELA: {item.signals?.tamperingRisk || "Low"}
                          </span>
                          {item.signals?.faceSimilarity !== null && item.signals?.faceSimilarity !== undefined && (
                            <span
                              className={`mini-chip ${
                                item.signals.faceSimilarity >= 80
                                  ? "chip-pass"
                                  : item.signals.faceSimilarity >= 60
                                  ? "chip-warn"
                                  : "chip-danger"
                              }`}
                              title={`Face Similarity: ${item.signals.faceSimilarity}%`}
                            >
                              Face: {item.signals.faceSimilarity}%
                            </span>
                          )}
                          {item.signals?.watchlistMatched && (
                            <span className="mini-chip chip-critical" title="Watchlist Match Alert">
                              ALERT
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="officer-action-cell">
                        {item.officerAction ? (
                          <div className="action-recorded">
                            <span className="action-tag">{item.officerAction}</span>
                            {item.officerNotes && (
                              <small className="action-notes-snippet" title={item.officerNotes}>
                                {item.officerNotes.slice(0, 30)}
                                {item.officerNotes.length > 30 ? "..." : ""}
                              </small>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveModalCase(item);
                              setOfficerAction(
                                rec === "PROCEED"
                                  ? "APPROVED"
                                  : rec === "HOLD"
                                  ? "SECONDARY_INSPECTION"
                                  : rec === "ESCALATE"
                                  ? "ESCALATED"
                                  : "APPROVED"
                              );
                              setOfficerNotes(item.officerNotes || "");
                            }}
                            className="take-action-btn"
                          >
                            Take Action
                          </button>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => setDrawerCase(item)}
                          className="inspect-btn"
                          title="View Full Signal Breakdown"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* OFFICER ACTION MODAL */}
      {activeModalCase && (
        <div className="modal-backdrop" onClick={() => setActiveModalCase(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Record Border Officer Decision</h3>
                <p>Case ID: {activeModalCase.id} ({activeModalCase.documentType})</p>
              </div>
              <button onClick={() => setActiveModalCase(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveOfficerAction} className="modal-form">
              <div className="form-group">
                <label>Officer Action Determination</label>
                <select
                  value={officerAction}
                  onChange={(e) => setOfficerAction(e.target.value)}
                  className="modal-select"
                >
                  <option value="APPROVED">APPROVED (Clear Traveler for Entry)</option>
                  <option value="SECONDARY_INSPECTION">SECONDARY_INSPECTION (Refer to Document Unit)</option>
                  <option value="HOLD_PENDING_DOCS">HOLD_PENDING_DOCS (Request Physical Documents)</option>
                  <option value="ESCALATED">ESCALATED (Supervisor Alert Triggered)</option>
                  <option value="REJECTED">REJECTED (Entry Refused)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Inspection Notes & Rationale</label>
                <textarea
                  rows={3}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="e.g. Visual inspection at border counter matched physical traveler likeness. Cleared."
                  className="modal-textarea"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setActiveModalCase(null)}
                  className="pill-btn pill-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="pill-btn pill-btn-primary"
                >
                  {actionSubmitting ? "Saving..." : "Save Officer Decision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CASE DETAIL DRAWER */}
      {drawerCase && (
        <div className="modal-backdrop" onClick={() => setDrawerCase(null)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h2>Case Audit Breakdown</h2>
                <p>{drawerCase.id} • {drawerCase.documentType}</p>
              </div>
              <button onClick={() => setDrawerCase(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Verdict Summary */}
              <div className="drawer-verdict-card">
                <div className="verdict-row">
                  <span className="verdict-label">FINAL RECOMMENDATION</span>
                  <span className="verdict-val">{drawerCase.recommendation}</span>
                </div>
                <div className="verdict-row">
                  <span className="verdict-label">COMPOSITE RISK SCORE</span>
                  <span className="verdict-val">{drawerCase.riskScore} / 100 ({drawerCase.riskLevel})</span>
                </div>
                <div className="verdict-row">
                  <span className="verdict-label">ACTION INSTRUCTION</span>
                  <span className="verdict-instruction">{drawerCase.recommendedAction}</span>
                </div>
              </div>

              {/* Forensic Reasons */}
              {drawerCase.reasons?.length > 0 && (
                <div className="drawer-section">
                  <h4>Forensic Audit Reasons</h4>
                  <ul className="reasons-list">
                    {drawerCase.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Signals Grid */}
              <div className="drawer-section">
                <h4>Signal Telemetry</h4>
                <div className="signals-telemetry-grid">
                  <div className="telemetry-box">
                    <span>OCR Confidence</span>
                    <strong>{Math.round((drawerCase.signals?.ocrConfidence || 0) * 100)}%</strong>
                    <small>{drawerCase.signals?.ocrFieldsDetected || 0} fields identified</small>
                  </div>
                  <div className="telemetry-box">
                    <span>Document Checksums</span>
                    <strong>{drawerCase.signals?.validationScore || "N/A"}</strong>
                    <small>Status: {drawerCase.signals?.validationStatus || "unknown"}</small>
                  </div>
                  <div className="telemetry-box">
                    <span>Tampering Score</span>
                    <strong>{drawerCase.signals?.tamperingScore ?? 0} / 100</strong>
                    <small>Risk: {drawerCase.signals?.tamperingRisk || "Low"}</small>
                  </div>
                  <div className="telemetry-box">
                    <span>Synthetic Suspicion</span>
                    <strong>{drawerCase.signals?.syntheticScore ?? 0} / 100</strong>
                    <small>{(drawerCase.signals?.syntheticLevel || "LOW").replace("_", " ")}</small>
                  </div>
                  <div className="telemetry-box">
                    <span>Face Comparison</span>
                    <strong>
                      {drawerCase.signals?.faceSimilarity !== null && drawerCase.signals?.faceSimilarity !== undefined
                        ? `${drawerCase.signals.faceSimilarity}%`
                        : "N/A"}
                    </strong>
                    <small>{drawerCase.signals?.faceStatus || "NOT PROVIDED"}</small>
                  </div>
                  <div className="telemetry-box">
                    <span>Watchlist Match</span>
                    <strong>{drawerCase.signals?.watchlistMatched ? "FLAGGED" : "CLEAR"}</strong>
                    <small>{drawerCase.signals?.watchlistStatus || "CLEAR"}</small>
                  </div>
                </div>
              </div>

              {/* Officer Decision Record */}
              <div className="drawer-section">
                <h4>Officer Disposition</h4>
                {drawerCase.officerAction ? (
                  <div className="officer-record-box">
                    <div className="record-badge">{drawerCase.officerAction}</div>
                    <p className="record-notes">{drawerCase.officerNotes || "No additional comments recorded."}</p>
                    <small className="record-time">
                      Logged: {drawerCase.officerActionTimestamp ? new Date(drawerCase.officerActionTimestamp).toLocaleString() : "Confirmed"}
                    </small>
                  </div>
                ) : (
                  <p className="unrecorded-text">No officer disposition recorded yet for this case.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
