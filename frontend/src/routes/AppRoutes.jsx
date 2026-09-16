import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Screening from "../pages/Screening";
import Cases from "../pages/Cases";
import History from "../pages/History";
import Alerts from "../pages/Alerts";
import Watchlist from "../pages/Watchlist";
import Analytics from "../pages/Analytics";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/screening" element={<Screening />} />
      <Route path="/cases" element={<Cases />} />
      <Route path="/history" element={<History />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/watchlist" element={<Watchlist />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}