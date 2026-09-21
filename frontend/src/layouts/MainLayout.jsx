import { Outlet, useLocation, Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../utils/api";

export default function MainLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [isOperational, setIsOperational] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function checkHealth() {
      try {
        const res = await api.checkHealth();
        if (mounted && res?.status === "operational") {
          setIsOperational(true);
        }
      } catch {
        if (mounted) setIsOperational(false);
      }
    }
    checkHealth();
    return () => {
      mounted = false;
    };
  }, []);

  // Home / Dashboard: Render clean standalone landing (no sidebar, no extra menubar chrome)
  if (isHome) {
    return <Outlet />;
  }

  // Screening / Scan workspace: Clean, distraction-free topbar header and full-width workspace
  return (
    <div className="workspace-shell">
      <header className="workspace-navbar">
        <div className="workspace-navbar-content">
          <Link to="/" className="workspace-brand" title="VeriGate Home">
            <div className="brand-badge-icon">
              <ShieldCheck size={18} />
            </div>
            <div className="brand-text">
              <strong>VeriGate</strong>
              <span>Screening Engine</span>
            </div>
          </Link>

          <div className="workspace-nav-center">
            <Link to="/" className="workspace-back-pill">
              <ArrowLeft size={14} />
              <span>Back to Overview</span>
            </Link>
          </div>

          <div className="workspace-nav-status">
            <div className="system-pill" title="Verification Engine Status">
              <span className={`status-indicator ${isOperational ? "online" : "offline"}`}></span>
              <span>{isOperational ? "Engine Ready" : "Connecting..."}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="workspace-main">
        <Outlet />
      </main>
    </div>
  );
}