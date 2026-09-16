import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { api } from "../utils/api";

const RISK_COLORS = {
  "Low Risk": "#3f7d5a",
  "Medium Risk": "#9a6b28",
  "High Risk": "#b84a39",
  "Critical Risk": "#8b1818",
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getAnalytics();
        if (res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !data) {
    return <div className="panel p-8 text-center">Loading analytics intelligence dashboard...</div>;
  }

  const { stats, riskDistribution, docTypeDistribution, screeningTrend, anomalyTrends } = data;

  return (
    <div className="analytics-page">
      {/* PAGE HEADING */}
      <section className="page-heading">
        <div>
          <span className="eyebrow">INTELLIGENCE & METRICS</span>
          <h1>Security & Risk Analytics</h1>
          <p>Statistical intelligence on document integrity, biometric verification, and threat volumes.</p>
        </div>
      </section>

      {/* TOP KPI STATS */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FileCheck2 size={20} />
          </div>
          <div className="stat-content">
            <span>Total Screenings</span>
            <strong>{stats.totalScreenings}</strong>
            <small>All time checkpoint screenings</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle2 size={20} className="text-success" />
          </div>
          <div className="stat-content">
            <span>Pass Clearance Rate</span>
            <strong>{stats.passRate}</strong>
            <small>Approved on primary check</small>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <AlertTriangle size={20} className="text-warning" />
          </div>
          <div className="stat-content">
            <span>Pending Reviews</span>
            <strong>{stats.flaggedDocuments}</strong>
            <small>Medium-risk manual inspections</small>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">
            <ShieldAlert size={20} className="text-danger" />
          </div>
          <div className="stat-content">
            <span>High Risk / Forgeries</span>
            <strong>{stats.highRiskCases}</strong>
            <small>Requires secondary detention</small>
          </div>
        </div>
      </section>

      {/* CHARTS ROW 1: TRENDS & RISK BREAKDOWN */}
      <div className="analytics-grid-two">
        {/* DAILY SCREENING VOLUME */}
        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <h2>Screening Volume & Clearance Trends</h2>
              <p>Weekly throughput: processed vs flagged documents</p>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={screeningTrend} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#8898aa" fontSize={11} />
                <YAxis stroke="#8898aa" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "6px",
                    fontSize: "11px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="passed" name="Cleared (Low Risk)" fill="#3f7d5a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="flagged" name="Flagged (Review/High)" fill="#b84a39" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RISK DISTRIBUTION PIE */}
        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <h2>Risk Level Distribution</h2>
              <p>Proportion of screenings by evaluated threat score</p>
            </div>
          </div>
          <div className="chart-container flex-pie-container">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {riskDistribution.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={RISK_COLORS[entry.name] || entry.color || "#315f8c"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "6px",
                    fontSize: "11px",
                  }}
                  formatter={(val) => [`${val}%`, "Share"]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2: DOCUMENT BREAKDOWN & ANOMALIES */}
      <div className="analytics-grid-two">
        {/* DOCUMENT TYPE DISTRIBUTION */}
        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <h2>Screenings by Credential Type</h2>
              <p>Breakdown across Passports, Visas, and National IDs</p>
            </div>
          </div>
          <div className="doc-distribution-list">
            {docTypeDistribution.map((doc) => (
              <div className="doc-dist-item" key={doc.type}>
                <div className="doc-dist-header">
                  <strong>{doc.type}</strong>
                  <span>{doc.count} screenings ({doc.percentage}%)</span>
                </div>
                <div className="risk-progress-track">
                  <div
                    className="risk-progress-fill"
                    style={{ width: `${doc.percentage}%`, backgroundColor: "#315f8c" }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ANOMALY TRENDS */}
        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <h2>Tampering & Biometric Mismatch Trends</h2>
              <p>Monthly forensic anomalies and facial mismatch rates</p>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={anomalyTrends} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#8898aa" fontSize={11} />
                <YAxis stroke="#8898aa" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "6px",
                    fontSize: "11px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Line
                  type="monotone"
                  dataKey="tampering"
                  name="Tampering Detected"
                  stroke="#b84a39"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="faceMismatch"
                  name="Biometric Mismatch"
                  stroke="#9a6b28"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
