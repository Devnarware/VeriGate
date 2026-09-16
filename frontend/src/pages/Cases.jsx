import { useState, useEffect } from "react";
import {
  FolderOpen,
  Search,
  Filter,
  Plus,
  Eye,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  User,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { api } from "../utils/api";

function RiskBadge({ risk }) {
  const r = (risk || "LOW").toLowerCase();
  return <span className={`risk-badge ${r}`}>{risk}</span>;
}

function StatusBadge({ status }) {
  const s = (status || "Open").toLowerCase().replace(/\s/g, "-");
  return <span className={`status-badge status-${s}`}>{status}</span>;
}

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [selectedCase, setSelectedCase] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCaseData, setNewCaseData] = useState({
    personName: "",
    documentType: "Passport",
    documentNumber: "",
    riskLevel: "HIGH",
    riskScore: 75,
    recommendation: "HOLD FOR SECONDARY VERIFICATION",
    notes: "",
    assignedOfficer: "Alex Singh",
  });

  const loadCases = async () => {
    try {
      setLoading(true);
      let query = "";
      const params = [];
      if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
      if (statusFilter !== "ALL") params.push(`status=${encodeURIComponent(statusFilter)}`);
      if (riskFilter !== "ALL") params.push(`risk=${encodeURIComponent(riskFilter)}`);
      if (params.length > 0) query = `?${params.join("&")}`;

      const res = await api.getCases(query);
      if (res?.data) {
        setCases(res.data);
      }
    } catch (err) {
      console.error("Error loading cases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [statusFilter, riskFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCases();
  };

  const handleStatusChange = async (caseId, newStatus) => {
    try {
      const res = await api.updateCase(caseId, { status: newStatus });
      if (res?.data) {
        setCases((prev) => prev.map((c) => (c.id === caseId ? res.data : c)));
        if (selectedCase?.id === caseId) {
          setSelectedCase(res.data);
        }
      }
    } catch (err) {
      alert(`Could not update case status: ${err.message}`);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createCase({
        ...newCaseData,
        reasons: ["Manual case opened at border checkpoint."],
        evidence: ["Officer physical inspection notes."],
      });
      if (res?.data) {
        setCases((prev) => [res.data, ...prev]);
        setShowNewModal(false);
        setNewCaseData({
          personName: "",
          documentType: "Passport",
          documentNumber: "",
          riskLevel: "HIGH",
          riskScore: 75,
          recommendation: "HOLD FOR SECONDARY VERIFICATION",
          notes: "",
          assignedOfficer: "Alex Singh",
        });
      }
    } catch (err) {
      alert(`Could not create case: ${err.message}`);
    }
  };

  return (
    <div className="cases-page">
      {/* PAGE HEADING */}
      <section className="page-heading">
        <div>
          <span className="eyebrow">BORDER CONTROL OPERATIONS</span>
          <h1>Case Management</h1>
          <p>
            Track, investigate, and review flagged credentials, secondary verification holds, and forensic investigations.
          </p>
        </div>

        <button className="primary-button" onClick={() => setShowNewModal(true)}>
          <Plus size={16} />
          Create New Case
        </button>
      </section>

      {/* FILTER BAR */}
      <div className="cases-filter-bar">
        <form onSubmit={handleSearchSubmit} className="cases-search-form">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search Case ID, Person Name, Document Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="secondary-button filter-btn">
            Search
          </button>
        </form>

        <div className="filter-dropdowns">
          <div className="select-wrapper">
            <span>Status:</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Under Review">Under Review</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="select-wrapper">
            <span>Risk Level:</span>
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
              <option value="ALL">All Risks</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* CASES TABLE */}
      <div className="panel cases-table-panel">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Person Name</th>
                <th>Document</th>
                <th>Risk Level</th>
                <th>Recommendation</th>
                <th>Status</th>
                <th>Officer</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-6">
                    Loading cases...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-6 muted">
                    No cases match the selected filters.
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.id}>
                    <td className="screening-id">{c.id}</td>
                    <td>
                      <strong>{c.personName}</strong>
                    </td>
                    <td>
                      {c.documentType} <small className="muted">({c.documentNumber})</small>
                    </td>
                    <td>
                      <RiskBadge risk={c.riskLevel} />{" "}
                      <span className="small-score">({c.riskScore}/100)</span>
                    </td>
                    <td>{c.recommendation}</td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td>{c.assignedOfficer}</td>
                    <td className="muted">
                      {new Date(c.lastUpdated || c.createdTime).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="text-button flex-btn"
                        onClick={() => setSelectedCase(c)}
                        title="View Case Details"
                      >
                        <Eye size={14} /> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CASE DETAILS MODAL / DRAWER */}
      {selectedCase && (
        <div className="modal-overlay" onClick={() => setSelectedCase(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">CASE DOSSIER</span>
                <h2>{selectedCase.id} — {selectedCase.personName}</h2>
                <p>Associated Verification: {selectedCase.verificationId}</p>
              </div>
              <button className="icon-button" onClick={() => setSelectedCase(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="case-meta-grid">
                <div>
                  <span>Document Type:</span>
                  <strong>{selectedCase.documentType} ({selectedCase.documentNumber})</strong>
                </div>
                <div>
                  <span>Risk Assessment:</span>
                  <strong>{selectedCase.riskLevel} ({selectedCase.riskScore}/100)</strong>
                </div>
                <div>
                  <span>Recommendation:</span>
                  <strong>{selectedCase.recommendation}</strong>
                </div>
                <div>
                  <span>Assigned Officer:</span>
                  <strong>{selectedCase.assignedOfficer}</strong>
                </div>
              </div>

              <div className="case-section">
                <h3>Current Status & Actions</h3>
                <div className="status-button-group">
                  {["Open", "Under Review", "Escalated", "Resolved", "Rejected", "Closed"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`status-chip ${selectedCase.status === st ? "active" : ""}`}
                      onClick={() => handleStatusChange(selectedCase.id, st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="case-section">
                <h3>Identified Findings & Reasons</h3>
                <ul className="modal-reasons-list">
                  {(selectedCase.reasons || []).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="case-section">
                <h3>Recorded Evidence</h3>
                <ul className="modal-evidence-list">
                  {(selectedCase.evidence || []).map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>
              </div>

              <div className="case-section">
                <h3>Officer Notes</h3>
                <p className="case-notes-box">{selectedCase.notes || "No additional notes recorded."}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="secondary-button" onClick={() => setSelectedCase(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW CASE MODAL */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-header">
                <div>
                  <span className="eyebrow">NEW INCIDENT DOSSIER</span>
                  <h2>Create Case</h2>
                </div>
                <button type="button" className="icon-button" onClick={() => setShowNewModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body form-grid">
                <div className="form-field">
                  <label>Person Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newCaseData.personName}
                    onChange={(e) => setNewCaseData({ ...newCaseData, personName: e.target.value })}
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div className="form-field">
                  <label>Document Type *</label>
                  <select
                    value={newCaseData.documentType}
                    onChange={(e) => setNewCaseData({ ...newCaseData, documentType: e.target.value })}
                  >
                    <option value="Passport">Passport</option>
                    <option value="Visa">Visa</option>
                    <option value="National ID">National ID</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Permit">Permit</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Document Number *</label>
                  <input
                    type="text"
                    required
                    value={newCaseData.documentNumber}
                    onChange={(e) => setNewCaseData({ ...newCaseData, documentNumber: e.target.value })}
                    placeholder="e.g. P9921048"
                  />
                </div>

                <div className="form-field">
                  <label>Risk Level</label>
                  <select
                    value={newCaseData.riskLevel}
                    onChange={(e) => setNewCaseData({ ...newCaseData, riskLevel: e.target.value })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div className="form-field full-width">
                  <label>Case Notes & Officer Summary</label>
                  <textarea
                    rows="3"
                    value={newCaseData.notes}
                    onChange={(e) => setNewCaseData({ ...newCaseData, notes: e.target.value })}
                    placeholder="Describe specific grounds for review or investigation..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-button" onClick={() => setShowNewModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
