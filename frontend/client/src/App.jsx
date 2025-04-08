import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { PermisosPage } from "./pages/PermisosPage";
import { PermisosFormPage } from "./pages/PermisosFormPage";
import { Navigation } from "./components/Navigation";
import PrivateRoute from "./components/PrivateRoute";
import InfantesList from "./pages/InfantesList";
import InfanteForm from "./pages/InfanteForm";

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

          {/* 🧒 Infantes */}
          <Route
            path="/infantes"
            element={
              <PrivateRoute>
                <Navigation />
                <InfantesList />
              </PrivateRoute>
            }
          />
          <Route
            path="/infantes-crear"
            element={
              <PrivateRoute>
                <Navigation />
                <InfanteForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/infantes/:id"
            element={
              <PrivateRoute>
                <InfanteForm />
              </PrivateRoute>
            }
          />  
      </Routes>
    </BrowserRouter>
  );
}

export default App;
