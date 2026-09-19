import { useState, useEffect } from "react";
import { ScanLine } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../../utils/api";

export default function Topbar() {
  const location = useLocation();
  const [isOperational, setIsOperational] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function checkSystem() {
      try {
        const res = await api.checkHealth();
        if (mounted && res?.status === "operational") {
          setIsOperational(true);
        }
      } catch {
        if (mounted) setIsOperational(false);
      }
    }
    checkSystem();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-title-area">
        <span className="topbar-crumb">
          {location.pathname === "/scan" ? "Document Screening" : "Overview"}
        </span>
      </div>

      <div className="topbar-actions">
        <div className="system-pill" title="Verification Engine Status">
          <span className={`status-indicator ${isOperational ? "online" : "offline"}`}></span>
          <span>{isOperational ? "Engine Ready" : "Connecting..."}</span>
        </div>

        {location.pathname !== "/scan" && (
          <Link to="/scan" className="topbar-cta-button">
            <ScanLine size={16} />
            <span>New Scan</span>
          </Link>
        )}
      </div>
    </header>
  );
}