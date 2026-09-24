import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Screening from "../pages/Screening";
import CaseHistory from "../pages/CaseHistory";
import WatchlistManagement from "../pages/WatchlistManagement";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/scan" element={<Screening />} />
      <Route path="/screening" element={<Navigate to="/scan" replace />} />
      <Route path="/cases" element={<CaseHistory />} />
      <Route path="/history" element={<Navigate to="/cases" replace />} />
      <Route path="/watchlist" element={<WatchlistManagement />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}