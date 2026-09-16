import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="*" element={<AppRoutes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;