import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Eye,
  Plus,
  Printer,
  X,
  CheckCircle2,
  Calendar,
  FileSpreadsheet,
} from "lucide-react";
import { api } from "../utils/api";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    reportType: "Daily Identity Screening Summary",
    dateFrom: "2026-03-01",
    dateTo: "2026-03-15",
  });

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await api.getReports();
      if (res?.data) {
        setReports(res.data);
      }
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.generateReport(generateForm);
      if (res?.data) {
        const newRep = {
          id: res.data.id,
          title: res.data.title,
          category: "Ad-hoc Operations",
          dateGenerated: new Date().toISOString().split("T")[0],
          totalRecords: res.data.totalProcessed,
          flaggedCount: res.data.highRiskCount + res.data.mediumRiskCount,
          format: "PDF",
          generatedBy: "Alex Singh",
          status: "Available",
        };
        setReports((prev) => [newRep, ...prev]);
        setShowGenerateModal(false);
        setSelectedReport(res.data);
      }
    } catch (err) {
      alert(`Could not generate report: ${err.message}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="reports-page">
      {/* PAGE HEADING */}
      <section className="page-heading">
        <div>
          <span className="eyebrow">AUDIT & EXPORT</span>
          <h1>Verification Reports</h1>
          <p>Official border security screening logs, high-risk case audits, and forensic summaries.</p>
        </div>

        <button className="primary-button" onClick={() => setShowGenerateModal(true)}>
          <Plus size={16} /> Generate New Report
        </button>
      </section>

      {/* REPORTS LIST TABLE */}
      <div className="panel cases-table-panel">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Report Title</th>
                <th>Category</th>
                <th>Date Generated</th>
                <th>Records</th>
                <th>Flagged Items</th>
                <th>Format</th>
                <th>Officer</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-6">
                    Loading reports...
                  </td>
                </tr>
              ) : (
                reports.map((rep) => (
                  <tr key={rep.id}>
                    <td className="screening-id">{rep.id}</td>
                    <td>
                      <strong>{rep.title}</strong>
                    </td>
                    <td>
                      <span className="category-pill">{rep.category}</span>
                    </td>
                    <td className="muted">{rep.dateGenerated}</td>
                    <td>{rep.totalRecords}</td>
                    <td>
                      <span className="text-danger font-semibold">{rep.flaggedCount}</span>
                    </td>
                    <td>{rep.format}</td>
                    <td>{rep.generatedBy}</td>
                    <td>
                      <div className="actions-cell-row">
                        <button
                          type="button"
                          className="text-button flex-btn"
                          onClick={() => setSelectedReport(rep)}
                          title="View Report Preview"
                        >
                          <Eye size={14} /> Preview
                        </button>
                        <button
                          type="button"
                          className="secondary-button btn-xs"
                          onClick={() => {
                            setSelectedReport(rep);
                            setTimeout(() => window.print(), 300);
                          }}
                          title="Download / Print PDF"
                        >
                          <Download size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REPORT PREVIEW MODAL */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content report-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">OFFICIAL BORDER SECURITY REPORT</span>
                <h2>{selectedReport.title}</h2>
                <p>Report Reference: {selectedReport.id}</p>
              </div>
              <div className="modal-header-actions">
                <button className="secondary-button btn-sm" onClick={handlePrint}>
                  <Printer size={14} /> Print / Export PDF
                </button>
                <button className="icon-button" onClick={() => setSelectedReport(null)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="modal-body printable-report-area">
              <div className="report-doc-header">
                <div>
                  <h3>VeriGate Border Screening Agency</h3>
                  <p>Immigration & Identity Security Division — Terminal 3</p>
                </div>
                <div className="report-meta-box">
                  <div>Date: {selectedReport.dateGenerated || new Date().toISOString().split("T")[0]}</div>
                  <div>Status: {selectedReport.status || "CONFIDENTIAL / LAW ENFORCEMENT"}</div>
                </div>
              </div>

              <hr className="report-rule" />

              <div className="report-metrics-summary">
                <div className="report-metric-box">
                  <span>Total Screenings</span>
                  <strong>{selectedReport.totalRecords || selectedReport.totalProcessed || 1284}</strong>
                </div>
                <div className="report-metric-box">
                  <span>Approved (Low Risk)</span>
                  <strong>{selectedReport.lowRiskCount || 1190}</strong>
                </div>
                <div className="report-metric-box">
                  <span>Manual Reviews</span>
                  <strong>{selectedReport.mediumRiskCount || 65}</strong>
                </div>
                <div className="report-metric-box danger">
                  <span>High Risk / Detained</span>
                  <strong>{selectedReport.highRiskCount || 21}</strong>
                </div>
              </div>

              <div className="report-section">
                <h4>Executive Summary</h4>
                <p>
                  This official screening audit reflects identity verification, document forensics, and biometric match
                  performance for the evaluated period. Automated anomaly detection identified {selectedReport.flaggedCount || 29}
                  flagged credentials requiring officer review or secondary forensic laboratory validation.
                </p>
              </div>

              <div className="report-section">
                <h4>Key Security Signals</h4>
                <ul className="report-list">
                  <li>Visual and error-level compression analysis flagged 16 substrate manipulation attempts.</li>
                  <li>Biometric facial geometry comparisons identified 19 identity divergence warnings.</li>
                  <li>Prototype Interpol watchlist integration generated 5 high-priority advisory matches.</li>
                </ul>
              </div>

              <div className="report-footer-signoff">
                <div>
                  <strong>Authorized Officer:</strong>
                  <span>Alex Singh (Badge: SEC-9941)</span>
                </div>
                <div>
                  <strong>Border Station:</strong>
                  <span>Terminal 3 International Arrivals</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="secondary-button" onClick={() => setSelectedReport(null)}>
                Close Preview
              </button>
              <button className="primary-button" onClick={handlePrint}>
                <Download size={15} /> Export PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE REPORT MODAL */}
      {showGenerateModal && (
        <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleGenerateSubmit}>
              <div className="modal-header">
                <div>
                  <span className="eyebrow">CUSTOM AUDIT DISPATCH</span>
                  <h2>Generate Verification Report</h2>
                </div>
                <button type="button" className="icon-button" onClick={() => setShowGenerateModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body form-grid">
                <div className="form-field full-width">
                  <label>Report Type *</label>
                  <select
                    value={generateForm.reportType}
                    onChange={(e) => setGenerateForm({ ...generateForm, reportType: e.target.value })}
                  >
                    <option value="Daily Identity Screening Summary">Daily Identity Screening Summary</option>
                    <option value="High-Risk & Forged Document Incident Audit">
                      High-Risk & Forged Document Incident Audit
                    </option>
                    <option value="Biometric & Tampering Anomaly Digest">Biometric & Tampering Anomaly Digest</option>
                    <option value="Interpol & Border Watchlist Hit Log">Interpol & Border Watchlist Hit Log</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Date From</label>
                  <input
                    type="date"
                    value={generateForm.dateFrom}
                    onChange={(e) => setGenerateForm({ ...generateForm, dateFrom: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Date To</label>
                  <input
                    type="date"
                    value={generateForm.dateTo}
                    onChange={(e) => setGenerateForm({ ...generateForm, dateTo: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-button" onClick={() => setShowGenerateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Compile & Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
