import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Screening from "../pages/Screening";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/scan" element={<Screening />} />
      <Route path="/screening" element={<Navigate to="/scan" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}