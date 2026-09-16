import {
  LayoutDashboard,
  ScanLine,
  FolderOpen,
  History,
  Bell,
  ShieldCheck,
  BarChart3,
  FileText,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    label: "Document Screening",
    icon: ScanLine,
    path: "/screening",
  },
  {
    label: "Cases",
    icon: FolderOpen,
    path: "/cases",
  },
  {
    label: "Verification History",
    icon: History,
    path: "/history",
  },
  {
    label: "Alerts",
    icon: Bell,
    path: "/alerts",
  },
  {
    label: "Watchlist",
    icon: ShieldCheck,
    path: "/watchlist",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    path: "/analytics",
  },
  {
    label: "Reports",
    icon: FileText,
    path: "/reports",
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">

      {/* Navigation */}
      <nav className="navigation">

        <div className="nav-section-title">
          MAIN
        </div>

        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className="nav-section-title settings-title">
          SYSTEM
        </div>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <Settings size={18} strokeWidth={1.8} />
          <span>Settings</span>
        </NavLink>

      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">

        <div className="system-status">
          <span className="status-dot"></span>

          <div>
            <strong>System Operational</strong>
            <small>All services running</small>
          </div>
        </div>

        <div className="sidebar-brand">
          <strong>VeriGate</strong>
          <span>Identity Security Platform</span>
        </div>

        <div className="version">
          Version 1.0
        </div>

      </div>

    </aside>
  );
}