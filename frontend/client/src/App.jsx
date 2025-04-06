import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { PermisosPage } from "./pages/PermisosPage";
import { PermisosFormPage } from "./pages/PermisosFormPage";
import { Navigation } from "./components/Navigation";
import PrivateRoute from "./components/PrivateRoute";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/permisos"
          element={
            <PrivateRoute>
              <Navigation />
              <PermisosPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/permisos-crear"
          element={
            <PrivateRoute>
              <Navigation />
              <PermisosFormPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/permisos/:id"
          element={
            <PrivateRoute>
              <PermisosFormPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
