import { useState, useEffect } from "react";
import {
  History as HistoryIcon,
  Search,
  Filter,
  Eye,
  FileCheck2,
  Calendar,
  X,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { api } from "../utils/api";

function RiskBadge({ risk }) {
  const r = (risk || "LOW").toLowerCase();
  return <span className={`risk-badge ${r}`}>{risk}</span>;
}

function StatusBadge({ status }) {
  const s = (status || "Verified").toLowerCase();
  return <span className={`status-badge ${s}`}>{status}</span>;
}

export default function History() {
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [docTypeFilter, setDocTypeFilter] = useState("ALL");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const params = [];
      if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
      if (riskFilter !== "ALL") params.push(`risk=${encodeURIComponent(riskFilter)}`);
      if (docTypeFilter !== "ALL") params.push(`documentType=${encodeURIComponent(docTypeFilter)}`);
      const query = params.length > 0 ? `?${params.join("&")}` : "";

      const res = await api.getScreenings(query);
      if (res?.data) {
        setScreenings(res.data);
      }
    } catch (err) {
      console.error("Error loading verification history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [riskFilter, docTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadHistory();
  };

  return (
    <div className="history-page">
      {/* PAGE HEADING */}
      <section className="page-heading">
        <div>
          <span className="eyebrow">SCREENING LOGS & AUDIT</span>
          <h1>Verification History</h1>
          <p>Complete historical ledger of all document screenings performed at checkpoints.</p>
        </div>
      </section>

      {/* FILTERS */}
      <div className="cases-filter-bar">
        <form onSubmit={handleSearchSubmit} className="cases-search-form">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search Verification ID, Person Name, Document Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="secondary-button filter-btn">
            Search
          </button>
        </form>

        <div className="filter-dropdowns">
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

          <div className="select-wrapper">
            <span>Doc Type:</span>
            <select value={docTypeFilter} onChange={(e) => setDocTypeFilter(e.target.value)}>
              <option value="ALL">All Types</option>
              <option value="Passport">Passport</option>
              <option value="Visa">Visa</option>
              <option value="National ID">National ID</option>
              <option value="Driving License">Driving License</option>
              <option value="Permit">Permit</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="panel cases-table-panel">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Verification ID</th>
                <th>Person</th>
                <th>Document Type</th>
                <th>Document No.</th>
                <th>Risk Score</th>
                <th>Recommendation</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-6">
                    Loading verification history...
                  </td>
                </tr>
              ) : screenings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-6 muted">
                    No verification records found.
                  </td>
                </tr>
              ) : (
                screenings.map((item) => (
                  <tr key={item.id}>
                    <td className="screening-id">{item.verificationId || item.id}</td>
                    <td>
                      <strong>{item.personName}</strong>
                    </td>
                    <td>{item.documentType}</td>
                    <td>{item.documentNumber}</td>
                    <td>
                      <RiskBadge risk={item.riskLevel} />{" "}
                      <span className="small-score">({item.riskScore}/100)</span>
                    </td>
                    <td>{item.recommendation}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="muted">
                      {new Date(item.timestamp).toLocaleString([], {
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
                        onClick={() => setSelectedRecord(item)}
                        title="View Full Verification Dossier"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">VERIFICATION DOSSIER</span>
                <h2>{selectedRecord.verificationId}</h2>
                <p>Subject: {selectedRecord.personName} ({selectedRecord.nationality || "N/A"})</p>
              </div>
              <button className="icon-button" onClick={() => setSelectedRecord(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="case-meta-grid">
                <div>
                  <span>Document Type:</span>
                  <strong>{selectedRecord.documentType} ({selectedRecord.documentNumber})</strong>
                </div>
                <div>
                  <span>Risk Score:</span>
                  <strong>{selectedRecord.riskScore}/100 ({selectedRecord.riskLevel})</strong>
                </div>
                <div>
                  <span>Decision:</span>
                  <strong>{selectedRecord.recommendation}</strong>
                </div>
                <div>
                  <span>Timestamp:</span>
                  <strong>{new Date(selectedRecord.timestamp).toLocaleString()}</strong>
                </div>
              </div>

              <div className="case-section">
                <h3>Decision Justification</h3>
                <ul className="modal-reasons-list">
                  {(selectedRecord.reasons || []).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {selectedRecord.ocr && (
                <div className="case-section">
                  <h3>Extracted OCR Fields</h3>
                  <div className="ocr-grid">
                    {Object.entries(selectedRecord.ocr)
                      .filter(([k]) => !["confidence", "fieldsDetected", "extractionTimeMs", "mrz", "sourceFile"].includes(k))
                      .map(([k, v]) => (
                        <div className="ocr-field" key={k}>
                          <span>{k.replace(/([A-Z])/g, " $1").trim()}</span>
                          <strong>{String(v)}</strong>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="case-section">
                <h3>Officer Directive</h3>
                <p className="case-notes-box">{selectedRecord.recommendedAction || "Proceed with standard processing."}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="secondary-button" onClick={() => setSelectedRecord(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
