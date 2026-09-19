import {
  LayoutDashboard,
  ScanLine,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  {
    label: "Home",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    label: "Scan Document",
    icon: ScanLine,
    path: "/scan",
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand-header">
        <div className="brand-badge-icon">
          <ShieldCheck size={22} />
        </div>
        <div className="brand-text">
          <strong>VeriGate</strong>
          <span>Document Screening</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="navigation">
        <div className="nav-section-title">NAVIGATION</div>

        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="privacy-badge">
          <Lock size={14} />
          <div>
            <strong>Privacy Assured</strong>
            <small>Documents analyzed in-memory & deleted immediately</small>
          </div>
        </div>

        <div className="version-tag">
          <span>VeriGate v1.0</span>
          <span className="version-dot"></span>
          <span>Open Screening</span>
        </div>
      </div>
    </aside>
  );
}