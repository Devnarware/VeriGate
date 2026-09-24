import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  ScanLine,
  Info,
  Check,
  Shield,
  FileWarning,
} from "lucide-react";
import { api } from "../utils/api";

export default function WatchlistManagement() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedDoc, setCopiedDoc] = useState(null);

  // New record form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    documentNumber: "",
    nationality: "",
    reason: "Reported Lost/Stolen Travel Document (SLTD)",
    riskLevel: "HIGH",
    source: "Interpol SLTD Mock",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchWatchlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getWatchlist();
      if (res.success && res.data) {
        setWatchlist(res.data);
      }
    } catch (err) {
      console.error("Failed to load watchlist:", err);
      setError("Unable to connect to local watchlist service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name && !formData.documentNumber) {
      alert("Please provide at least a Subject Name or Document Number.");
      return;
    }
    setSubmitting(true);
    try {
      await api.addWatchlistRecord(formData);
      setFormData({
        name: "",
        documentNumber: "",
        nationality: "",
        reason: "Reported Lost/Stolen Travel Document (SLTD)",
        riskLevel: "HIGH",
        source: "Interpol SLTD Mock",
      });
      setShowAddForm(false);
      await fetchWatchlist();
    } catch (err) {
      alert("Failed to add entry: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.toggleWatchlistStatus(id);
      await fetchWatchlist();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this entry from the prototype watchlist?")) return;
    try {
      await api.deleteWatchlistRecord(id);
      await fetchWatchlist();
    } catch (err) {
      alert("Failed to delete record: " + err.message);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset watchlist to default initial test entries?")) return;
    try {
      await api.resetWatchlist();
      await fetchWatchlist();
    } catch (err) {
      alert("Failed to reset watchlist: " + err.message);
    }
  };

  const handleCopyDoc = (docNum) => {
    if (!docNum) return;
    navigator.clipboard.writeText(docNum);
    setCopiedDoc(docNum);
    setTimeout(() => setCopiedDoc(null), 2000);
  };

  // Metrics
  const total = watchlist.length;
  const activeCount = watchlist.filter((w) => w.status === "ACTIVE").length;
  const criticalCount = watchlist.filter((w) => w.riskLevel === "CRITICAL").length;
  const stolenCount = watchlist.filter(
    (w) => (w.reason || "").toLowerCase().includes("stolen") || (w.reason || "").toLowerCase().includes("lost")
  ).length;

  return (
    <div className="watchlist-page-container">
      {/* HEADER SECTION */}
      <div className="watchlist-header-card">
        <div className="watchlist-header-left">
          <div className="eyebrow-chip">
            <ShieldAlert size={13} />
            <span>ICAO 9303 & INTERPOL SLTD SIMULATION</span>
          </div>
          <h1 className="watchlist-title">Watchlist Screening Simulator</h1>
          <p className="watchlist-subtitle">
            Manage simulated stolen travel documents, identity discrepancy alerts, and test alert triggers.
          </p>
        </div>

        <div className="watchlist-header-actions">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="pill-btn pill-btn-primary"
          >
            <Plus size={16} />
            <span>{showAddForm ? "Close Form" : "Add Flagged Entry"}</span>
          </button>
          <button onClick={fetchWatchlist} className="pill-btn pill-btn-secondary" title="Refresh">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleReset}
            className="pill-btn pill-btn-secondary"
            title="Restore Defaults"
          >
            <RotateCcw size={15} />
            <span>Restore Defaults</span>
          </button>
        </div>
      </div>

      {/* COMPLIANCE & HONEST DISCLAIMER BANNER */}
      <div className="watchlist-disclaimer-banner">
        <Info size={16} className="disclaimer-icon" />
        <div className="disclaimer-text">
          <strong>Prototype Simulation Notice:</strong>
          <span>
            This database is a local testing harness modeled after the Interpol Stolen and Lost Travel Document (SLTD) and ICAO Doc 9303 schemas. VeriGate runs screenings against this local fixture for demonstrations; it does not connect to live law enforcement or government servers.
          </span>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="watchlist-metrics-grid">
        <div className="watchlist-metric-card">
          <span className="metric-label">TOTAL WATCHED RECORDS</span>
          <div className="metric-val">{total}</div>
          <span className="metric-sub">Local prototype database</span>
        </div>

        <div className="watchlist-metric-card">
          <span className="metric-label">ACTIVE ENFORCEMENT</span>
          <div className="metric-val text-primary">{activeCount}</div>
          <span className="metric-sub">Will trigger immediate ALERT in scan</span>
        </div>

        <div className="watchlist-metric-card">
          <span className="metric-label">REPORTED STOLEN / LOST</span>
          <div className="metric-val text-warning">{stolenCount}</div>
          <span className="metric-sub">SLTD matched document numbers</span>
        </div>

        <div className="watchlist-metric-card">
          <span className="metric-label">CRITICAL RISK SUBJECTS</span>
          <div className="metric-val text-danger">{criticalCount}</div>
          <span className="metric-sub">Immediate supervisor escalation</span>
        </div>
      </div>

      {/* ADD ENTRY FORM (Collapsible) */}
      {showAddForm && (
        <div className="watchlist-form-card">
          <div className="form-card-header">
            <h3>Add New Watchlist Test Record</h3>
            <p>Define an identity record or document number to trigger an alert during live screening.</p>
          </div>

          <form onSubmit={handleCreate} className="watchlist-add-form">
            <div className="form-grid-3">
              <div className="form-group">
                <label>Document Number (Passport / ID)</label>
                <input
                  type="text"
                  placeholder="e.g. M90124881 or P8829104"
                  value={formData.documentNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, documentNumber: e.target.value.toUpperCase() })
                  }
                  className="form-input"
                />
                <small className="form-help">Exact document number match triggers highest fidelity alert.</small>
              </div>

              <div className="form-group">
                <label>Subject Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Tariq Al-Mansoor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
                <small className="form-help">Supports multi-token fuzzy biographic matching.</small>
              </div>

              <div className="form-group">
                <label>Nationality / Issuing State</label>
                <input
                  type="text"
                  placeholder="e.g. Syrian, Indian, French"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label>Alert Category / Reason</label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="form-select"
                >
                  <option value="Reported Lost/Stolen Travel Document (SLTD)">
                    Reported Lost/Stolen Travel Document (SLTD)
                  </option>
                  <option value="Flagged Identity Record - Impersonation Alert">
                    Flagged Identity Record - Impersonation Alert
                  </option>
                  <option value="Document Discrepancy & Fraud Investigation">
                    Document Discrepancy & Fraud Investigation
                  </option>
                  <option value="Interpol Red Notice Mock Simulation">
                    Interpol Red Notice Mock Simulation
                  </option>
                  <option value="National Border Security Advisory">
                    National Border Security Advisory
                  </option>
                  <option value="Expired Permit & Revocation Flag">
                    Expired Permit & Revocation Flag
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Assigned Risk Severity</label>
                <select
                  value={formData.riskLevel}
                  onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                  className="form-select"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div className="form-group">
                <label>Simulated Authority Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="form-select"
                >
                  <option value="Interpol SLTD Mock">Interpol SLTD Mock</option>
                  <option value="National Immigration Warning System">
                    National Immigration Warning System
                  </option>
                  <option value="Civil Registry Discrepancy Unit">
                    Civil Registry Discrepancy Unit
                  </option>
                  <option value="Local Test Database">Local Test Database</option>
                </select>
              </div>
            </div>

            <div className="form-actions-row">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="pill-btn pill-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="pill-btn pill-btn-primary"
              >
                {submitting ? "Saving..." : "Add to Watchlist"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* WATCHLIST RECORDS TABLE */}
      <div className="watchlist-table-card">
        <div className="table-card-top">
          <h3>Active Test Fixtures ({watchlist.length})</h3>
          <p>
            Copy any document number below and test it during screening to demonstrate instant alert flagging.
          </p>
        </div>

        {loading ? (
          <div className="cases-loading-state">
            <RefreshCw size={24} className="spin-icon" />
            <p>Loading watchlist records...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="cases-table">
              <thead>
                <tr>
                  <th>RECORD ID</th>
                  <th>DOCUMENT NUMBER</th>
                  <th>SUBJECT NAME</th>
                  <th>NATIONALITY</th>
                  <th>ALERT REASON</th>
                  <th>SEVERITY</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((item) => {
                  const isActive = item.status === "ACTIVE";
                  const riskLevel = (item.riskLevel || "HIGH").toUpperCase();
                  const riskClass =
                    riskLevel === "CRITICAL"
                      ? "badge-escalate"
                      : riskLevel === "HIGH"
                      ? "badge-hold"
                      : "badge-review";

                  return (
                    <tr key={item.id} className={`case-row ${!isActive ? "row-inactive" : ""}`}>
                      <td className="case-id-cell">
                        <strong>{item.id}</strong>
                        <span className="case-latency">{item.source || "Mock SLTD"}</span>
                      </td>

                      <td className="doc-num-cell">
                        {item.documentNumber ? (
                          <div className="doc-copy-pill">
                            <span className="font-mono">{item.documentNumber}</span>
                            <button
                              onClick={() => handleCopyDoc(item.documentNumber)}
                              className="copy-btn"
                              title="Copy Document Number for Testing"
                            >
                              {copiedDoc === item.documentNumber ? (
                                <Check size={13} className="text-success" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted">Unspecified</span>
                        )}
                      </td>

                      <td className="case-doctype-cell">
                        <strong>{item.name || "N/A"}</strong>
                      </td>

                      <td className="case-time-cell">{item.nationality || "Unknown"}</td>

                      <td className="reason-cell">
                        <span className="reason-text">{item.reason}</span>
                      </td>

                      <td>
                        <span className={`decision-pill ${riskClass}`}>{riskLevel}</span>
                      </td>

                      <td>
                        <button
                          onClick={() => handleToggle(item.id)}
                          className={`status-toggle-btn ${isActive ? "active-btn" : "inactive-btn"}`}
                          title="Click to toggle active state"
                        >
                          {isActive ? "ACTIVE" : "INACTIVE"}
                        </button>
                      </td>

                      <td className="actions-cell">
                        <div className="action-btns-row">
                          <Link
                            to="/scan"
                            className="test-scan-btn"
                            title="Go to scan document page"
                          >
                            <ScanLine size={14} />
                            <span>Test</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="delete-icon-btn"
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
