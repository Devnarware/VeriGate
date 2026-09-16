import { useState, useEffect } from "react";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  AlertOctagon,
  Clock,
  Check,
  RotateCcw,
} from "lucide-react";
import { api } from "../utils/api";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const params = [];
      if (severityFilter !== "ALL") params.push(`severity=${encodeURIComponent(severityFilter)}`);
      if (statusFilter !== "ALL") params.push(`status=${encodeURIComponent(statusFilter)}`);
      const query = params.length > 0 ? `?${params.join("&")}` : "";

      const res = await api.getAlerts(query);
      if (res?.data) {
        setAlerts(res.data);
      }
    } catch (err) {
      console.error("Error loading alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [severityFilter, statusFilter]);

  const updateAlertStatus = async (id, newStatus) => {
    try {
      const res = await api.updateAlert(id, { status: newStatus });
      if (res?.data) {
        setAlerts((prev) => prev.map((a) => (a.id === id ? res.data : a)));
      }
    } catch (err) {
      alert(`Could not update alert: ${err.message}`);
    }
  };

  return (
    <div className="alerts-page">
      {/* PAGE HEADING */}
      <section className="page-heading">
        <div>
          <span className="eyebrow">REAL-TIME THREAT MONITORING</span>
          <h1>Security Alerts</h1>
          <p>Active anomaly notifications, watchlist triggers, and biometric discrepancy events.</p>
        </div>
      </section>

      {/* FILTERS */}
      <div className="cases-filter-bar">
        <div className="filter-dropdowns">
          <div className="select-wrapper">
            <span>Severity:</span>
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>

          <div className="select-wrapper">
            <span>Status:</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="New">New</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* ALERTS LIST */}
      <div className="alerts-container">
        {loading ? (
          <div className="panel p-6 text-center">Loading security alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="panel p-6 text-center muted">No alerts match the selected criteria.</div>
        ) : (
          alerts.map((alert) => {
            const sev = (alert.severity || "High").toLowerCase();
            const Icon = sev === "critical" ? AlertOctagon : AlertTriangle;

            return (
              <div key={alert.id} className={`alert-card-item ${sev}`}>
                <div className={`alert-card-icon ${sev}`}>
                  <Icon size={22} />
                </div>

                <div className="alert-card-content">
                  <div className="alert-card-header">
                    <div>
                      <span className="alert-id-tag">{alert.id}</span>
                      <h3>{alert.title}</h3>
                    </div>
                    <div className="alert-badges-row">
                      <span className={`severity ${sev}`}>{alert.severity}</span>
                      <span className={`status-pill ${(alert.status || "New").toLowerCase()}`}>
                        {alert.status}
                      </span>
                    </div>
                  </div>

                  <p className="alert-desc">{alert.description}</p>

                  <div className="alert-card-footer">
                    <div className="alert-meta-tags">
                      <span>Type: {alert.type || "Document Tampering"}</span>
                      {alert.verificationId && <span>Verification: {alert.verificationId}</span>}
                      {alert.caseId && <span>Case: {alert.caseId}</span>}
                      <span className="alert-time">
                        <Clock size={12} /> {alert.time || "Recent"}
                      </span>
                    </div>

                    <div className="alert-action-buttons">
                      {alert.status === "New" && (
                        <button
                          type="button"
                          className="secondary-button btn-sm"
                          onClick={() => updateAlertStatus(alert.id, "Acknowledged")}
                        >
                          <Check size={13} /> Acknowledge
                        </button>
                      )}

                      {alert.status !== "Resolved" && (
                        <button
                          type="button"
                          className="primary-button btn-sm"
                          onClick={() => updateAlertStatus(alert.id, "Resolved")}
                        >
                          <CheckCircle2 size={13} /> Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
