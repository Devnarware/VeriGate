import { useState, useEffect } from "react";
import { Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

export default function Topbar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [alertCount, setAlertCount] = useState(3);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const res = await api.getAlerts("?status=New");
        if (res?.data) {
          setAlertCount(res.data.length);
        }
      } catch (err) {
        // silent fallback
      }
    }
    loadAlerts();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/history?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="topbar">
      <form onSubmit={handleSearchSubmit} className="topbar-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search screening ID, passport or person..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      <div className="topbar-actions">
        <button
          className="icon-button"
          title="Security Alerts"
          onClick={() => navigate("/alerts")}
        >
          <Bell size={19} />
          {alertCount > 0 && <span className="notification-dot"></span>}
        </button>

        <div className="officer-profile" onClick={() => navigate("/settings")} style={{ cursor: "pointer" }}>
          <div className="avatar">AS</div>
          <div className="officer-info">
            <strong>Alex Singh</strong>
            <span>Security Officer</span>
          </div>
        </div>
      </div>
    </header>
  );
}