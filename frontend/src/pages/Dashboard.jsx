import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Clock3,
  FileCheck2,
  ArrowRight,
  ShieldAlert,
  FolderOpen,
  Search,
  FileText,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../utils/api";

function StatCard({ icon: Icon, label, value, description, color = "default" }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        <Icon size={20} />
      </div>

      <div className="stat-content">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>
    </div>
  );
}

function RiskBadge({ risk }) {
  const r = (risk || "Low").toLowerCase();
  return <span className={`risk-badge ${r}`}>{risk}</span>;
}

function StatusBadge({ status }) {
  const s = (status || "Verified").toLowerCase();
  return <span className={`status-badge ${s}`}>{status}</span>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    screeningsToday: 1284,
    flaggedDocuments: 37,
    highRiskCases: 8,
    activeAlerts: 3,
    averageScreeningTime: "8.4 sec",
  });
  const [recentScreenings, setRecentScreenings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [riskDistribution, setRiskDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, screeningsRes, alertsRes] = await Promise.all([
        api.getAnalytics().catch(() => ({ data: {} })),
        api.getScreenings("?limit=6").catch(() => ({ data: [] })),
        api.getAlerts().catch(() => ({ data: [] })),
      ]);

      if (analyticsRes?.data?.stats) {
        setStats(analyticsRes.data.stats);
      }
      if (analyticsRes?.data?.riskDistribution) {
        setRiskDistribution(analyticsRes.data.riskDistribution);
      }
      if (screeningsRes?.data) {
        setRecentScreenings(screeningsRes.data.slice(0, 5));
      }
      if (alertsRes?.data) {
        setAlerts(alertsRes.data.slice(0, 3));
      }
    } catch (err) {
      console.warn("Could not load fresh dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="dashboard">
      {/* PAGE HEADING */}
      <section className="page-heading">
        <div>
          <span className="eyebrow">BORDER CONTROL & IMMIGRATION SECURITY</span>
          <h1>Good morning, Officer Alex</h1>
          <p>
            Real-time biometric and document screening operations across Terminal 3 Checkpoints.
          </p>
        </div>

        <div className="page-heading-actions">
          <button className="secondary-button" onClick={loadDashboardData} title="Refresh Live Data">
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            Refresh
          </button>
          <button className="primary-button" onClick={() => navigate("/screening")}>
            <Activity size={17} />
            Start Screening
          </button>
        </div>
      </section>

      {/* QUICK ACTIONS BAR */}
      <section className="quick-actions-bar">
        <span className="quick-actions-label">QUICK ACTIONS:</span>
        <div className="quick-actions-buttons">
          <Link to="/screening" className="quick-action-btn">
            <Activity size={14} /> New Screening
          </Link>
          <Link to="/cases" className="quick-action-btn">
            <FolderOpen size={14} /> View Cases
          </Link>
          <Link to="/alerts" className="quick-action-btn">
            <AlertTriangle size={14} /> View Alerts
          </Link>
          <Link to="/watchlist" className="quick-action-btn">
            <Search size={14} /> Search Watchlist
          </Link>
          <Link to="/reports" className="quick-action-btn">
            <FileText size={14} /> Generate Report
          </Link>
        </div>
      </section>

      {/* STATS OVERVIEW */}
      <section className="stats-grid">
        <StatCard
          icon={FileCheck2}
          label="Today's Screenings"
          value={stats.screeningsToday || 1284}
          description="Total documents processed"
        />

        <StatCard
          icon={AlertTriangle}
          label="Pending Reviews"
          value={stats.flaggedDocuments || 37}
          description="Medium risk / manual review"
          color="warning"
        />

        <StatCard
          icon={ShieldAlert}
          label="High Risk Cases"
          value={stats.highRiskCases || 8}
          description="Awaiting officer disposition"
          color="danger"
        />

        <StatCard
          icon={Clock3}
          label="Average Screening Time"
          value={stats.averageScreeningTime || "8.4 sec"}
          description="AI pipeline speed"
        />
      </section>

      {/* MAIN DASHBOARD GRID */}
      <section className="dashboard-grid">
        {/* RECENT SCREENINGS */}
        <div className="panel recent-panel">
          <div className="panel-header">
            <div>
              <h2>Recent Screenings</h2>
              <p>Latest document verification activity and decisions</p>
            </div>

            <Link to="/history" className="text-button">
              View all
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Screening ID</th>
                  <th>Person</th>
                  <th>Document</th>
                  <th>Decision</th>
                  <th>Risk Score</th>
                  <th>Time</th>
                </tr>
              </thead>

              <tbody>
                {recentScreenings.map((item) => (
                  <tr key={item.id}>
                    <td className="screening-id">{item.verificationId || item.id}</td>
                    <td>
                      <strong>{item.personName || item.name}</strong>
                    </td>
                    <td>{item.documentType || item.document}</td>
                    <td>
                      <StatusBadge status={item.recommendation || item.status} />
                    </td>
                    <td>
                      <RiskBadge risk={item.riskLevel || item.risk} />{" "}
                      <span className="small-score">({item.riskScore || 18}/100)</span>
                    </td>
                    <td className="muted">{item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (item.time || "Recent")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PRIORITY ALERTS */}
        <div className="panel alerts-panel">
          <div className="panel-header">
            <div>
              <h2>Priority Alerts</h2>
              <p>Critical issues requiring immediate attention</p>
            </div>

            <div className="alert-count">{alerts.length}</div>
          </div>

          <div className="alerts-list">
            {alerts.map((alert) => (
              <div className="alert-item" key={alert.id}>
                <div className={`alert-icon ${(alert.severity || "high").toLowerCase()}`}>
                  <AlertTriangle size={17} />
                </div>

                <div className="alert-content">
                  <div className="alert-title-row">
                    <strong>{alert.title}</strong>
                    <span className={`severity ${(alert.severity || "high").toLowerCase()}`}>
                      {alert.severity}
                    </span>
                  </div>

                  <p>{alert.description}</p>
                  <div className="alert-meta-row">
                    <small>{alert.time || "Just now"}</small>
                    <Link to="/alerts" className="alert-link-action">
                      Acknowledge
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RISK OVERVIEW BAR */}
      {riskDistribution.length > 0 && (
        <section className="risk-overview-section">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Risk Distribution Overview</h2>
                <p>Aggregate risk level distribution of recent border screenings</p>
              </div>
              <Link to="/analytics" className="text-button">
                Detailed Analytics <ArrowRight size={14} />
              </Link>
            </div>

            <div className="risk-bars-container">
              {riskDistribution.map((item) => (
                <div className="risk-bar-item" key={item.name}>
                  <div className="risk-bar-header">
                    <span>{item.name}</span>
                    <strong>{item.value}%</strong>
                  </div>
                  <div className="risk-progress-track">
                    <div
                      className="risk-progress-fill"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: item.color || "#315f8c",
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DECISION SUPPORT HERO */}
      <section className="decision-panel">
        <div className="decision-icon">
          <ShieldAlert size={23} />
        </div>

        <div className="decision-content">
          <span className="eyebrow">VERIGATE DECISION SUPPORT</span>
          <h2>Every screening ends with an explainable, actionable decision.</h2>
          <p>
            VeriGate eliminates binary guesswork by combining OCR verification, optical document forensics,
            1:1 biometric facial comparison, and watchlist intelligence into an explainable officer recommendation:
            <strong> PROCEED</strong>, <strong>MANUAL REVIEW</strong>, <strong>HOLD FOR SECONDARY</strong>, or <strong>ESCALATE</strong>.
          </p>
        </div>

        <button className="secondary-button" onClick={() => navigate("/screening")}>
          Test AI Pipeline
          <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}