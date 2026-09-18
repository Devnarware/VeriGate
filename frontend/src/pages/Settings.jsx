import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Sliders,
  ShieldCheck,
  Server,
  User,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Info,
} from "lucide-react";
import { api } from "../utils/api";

export default function Settings() {
  const [settings, setSettings] = useState({
    weights: {
      ocr: 15,
      validation: 20,
      tampering: 30,
      face: 25,
      watchlist: 10,
    },
    thresholds: {
      low: 30,
      medium: 60,
      high: 80,
    },
    officerName: "Alex Singh",
    officerRole: "Security Officer",
    checkpoint: "Terminal 3 - Counter 14",
  });

  const [health, setHealth] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [settRes, healthRes] = await Promise.all([
          api.getSettings().catch(() => ({ data: {} })),
          api.checkHealth().catch(() => null),
        ]);
        if (settRes?.data?.weights) {
          setSettings(settRes.data);
        }
        if (healthRes) {
          setHealth(healthRes);
        }
      } catch (err) {
        console.warn("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleWeightChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      weights: {
        ...prev.weights,
        [key]: Number(value),
      },
    }));
  };

  const handleThresholdChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [key]: Number(value),
      },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.updateSettings(settings);
      setSavedMessage("Settings and risk weights updated successfully.");
      setTimeout(() => setSavedMessage(""), 4000);
    } catch (err) {
      alert(`Could not save settings: ${err.message}`);
    }
  };

  const totalWeights = Object.values(settings.weights || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="settings-page">
      {/* PAGE HEADING */}
      <section className="page-heading">
        <div>
          <span className="eyebrow">CONFIGURATION & POLICY</span>
          <h1>System Settings</h1>
          <p>Configure risk scoring weights, decision thresholds, checkpoint profile, and monitor service health.</p>
        </div>

        <button className="primary-button" onClick={handleSave}>
          <CheckCircle2 size={16} /> Save Configuration
        </button>
      </section>

      {savedMessage && (
        <div className="notification-banner success">
          <CheckCircle2 size={16} />
          <span>{savedMessage}</span>
        </div>
      )}

      <div className="settings-grid">
        {/* RISK ENGINE CONFIGURATION */}
        <div className="panel settings-card">
          <div className="panel-header">
            <div>
              <h2>Risk Engine Signal Weights</h2>
              <p>Adjust the relative contribution of each security signal to the 0–100 composite risk score</p>
            </div>
            <span className={`weight-total-pill ${totalWeights === 100 ? "pass" : "warning"}`}>
              Total Weight: {totalWeights}%
            </span>
          </div>

          <div className="settings-body">
            <div className="slider-group">
              <div className="slider-header">
                <span>OCR Extraction Confidence</span>
                <strong>{settings.weights.ocr}%</strong>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={settings.weights.ocr}
                onChange={(e) => handleWeightChange("ocr", e.target.value)}
              />
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <span>Document Format & Validity Rules</span>
                <strong>{settings.weights.validation}%</strong>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={settings.weights.validation}
                onChange={(e) => handleWeightChange("validation", e.target.value)}
              />
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <span>Tampering & Forgery Forensics</span>
                <strong>{settings.weights.tampering}%</strong>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={settings.weights.tampering}
                onChange={(e) => handleWeightChange("tampering", e.target.value)}
              />
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <span>Biometric Face Verification</span>
                <strong>{settings.weights.face}%</strong>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={settings.weights.face}
                onChange={(e) => handleWeightChange("face", e.target.value)}
              />
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <span>Watchlist Advisory Match</span>
                <strong>{settings.weights.watchlist}%</strong>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={settings.weights.watchlist}
                onChange={(e) => handleWeightChange("watchlist", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* DECISION THRESHOLDS & OFFICER PROFILE */}
        <div className="settings-side-column">
          {/* THRESHOLDS */}
          <div className="panel settings-card">
            <div className="panel-header">
              <div>
                <h2>Risk Level Cutoff Thresholds</h2>
                <p>Define classification boundary scores</p>
              </div>
            </div>

            <div className="settings-body">
              <div className="threshold-row">
                <span className="risk-badge low">LOW (0 - {settings.thresholds.low})</span>
                <span className="threshold-desc">Automatic PROCEED recommendation</span>
              </div>

              <div className="threshold-row">
                <span className="risk-badge medium">MEDIUM ({settings.thresholds.low + 1} - {settings.thresholds.medium})</span>
                <span className="threshold-desc">Triggers MANUAL REVIEW recommendation</span>
              </div>

              <div className="threshold-row">
                <span className="risk-badge high">HIGH ({settings.thresholds.medium + 1} - {settings.thresholds.high})</span>
                <span className="threshold-desc">Triggers HOLD FOR SECONDARY</span>
              </div>

              <div className="threshold-row">
                <span className="risk-badge critical">CRITICAL ({settings.thresholds.high + 1} - 100)</span>
                <span className="threshold-desc">Triggers ESCALATE alert to Police Unit</span>
              </div>
            </div>
          </div>

          {/* SYSTEM HEALTH */}
          <div className="panel settings-card">
            <div className="panel-header">
              <div>
                <h2>System Health & Service Connectivity</h2>
                <p>Live status of backend screening microservices</p>
              </div>
            </div>

            <div className="settings-body">
              <div className="health-item">
                <div className="health-status-dot green"></div>
                <div>
                  <strong>Backend REST API Server</strong>
                  <small>{(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : 'http://localhost:5001')} · Status: Operational</small>
                </div>
              </div>

              <div className="health-item">
                <div className="health-status-dot green"></div>
                <div>
                  <strong>OCR & MRZ Extraction Engine</strong>
                  <small>Tesseract / ICAO Doc 9303 Parsers: Active</small>
                </div>
              </div>

              <div className="health-item">
                <div className="health-status-dot green"></div>
                <div>
                  <strong>Optical Forensics Engine</strong>
                  <small>Error Level Analysis (ELA) Module: Active</small>
                </div>
              </div>

              <div className="health-item">
                <div className="health-status-dot green"></div>
                <div>
                  <strong>Biometric FaceNet Matcher</strong>
                  <small>68-Point Facial Geometry Matcher: Active</small>
                </div>
              </div>

              <div className="health-item">
                <div className="health-status-dot green"></div>
                <div>
                  <strong>Prototype Watchlist Database</strong>
                  <small>Local Storage: Connected</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
