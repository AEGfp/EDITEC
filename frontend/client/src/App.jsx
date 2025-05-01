import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { PermisosPage } from "./pages/PermisosPage";
import { PermisosFormPage } from "./pages/PermisosFormPage";
import PrivateRoute from "./components/PrivateRoute";
import InfantesList from "./pages/InfantesList";
import InfanteForm from "./pages/InfantesForm";
import SalasList from "./pages/SalasList";
import SalasFormPage from "./pages/SalasFormPage";
import TurnosFormPage from "./pages/TurnosFormPage";
import TurnosList from "./pages/TurnosList";
import TutoresList from "./pages/TutoresList";
import TutoresFormPage from "./pages/TutoresFormPage";
import SignUpPage from "./pages/SignUpPage";
import AccesoDenegado from "./pages/AccesoDenegado";
import HomePage from "./pages/HomePage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/acceso-denegado" element={<AccesoDenegado />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage></HomePage>
            </PrivateRoute>
          }
        />
        <Route
          path="/permisos"
          element={
            <PrivateRoute rolesPermitidos={["director"]}>
              <PermisosPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/permisos-crear"
          element={
            <PrivateRoute>
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
              <InfantesList />
            </PrivateRoute>
          }
        />
        <Route
          path="/infantes-crear"
          element={
            <PrivateRoute>
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
        {/* Salas */}
        <Route
          path="/salas"
          element={
            <PrivateRoute>
              <SalasList />
            </PrivateRoute>
          }
        />
        <Route
          path="/salas-crear"
          element={
            <PrivateRoute>
              <SalasFormPage />
            </PrivateRoute>
          }
        />
        {/* Turnos */}
        <Route
          path="/turnos"
          element={
            <PrivateRoute>
              <TurnosList />
            </PrivateRoute>
          }
        />
        <Route
          path="/turnos-crear"
          element={
            <PrivateRoute>
              <TurnosFormPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/turnos-id"
          element={
            <PrivateRoute>
              <TurnosFormPage />
            </PrivateRoute>
          }
        />
        {/* Tutores */}
        <Route
          path="/tutores"
          element={
            <PrivateRoute>
              <TutoresList />
            </PrivateRoute>
          }
        />
        <Route
          path="/tutores-crear"
          element={
            <PrivateRoute>
              <TutoresFormPage />
            </PrivateRoute>
          }
        />
        {/* Turnos */}
        <Route
          path="/turnos"
          element={
            <PrivateRoute>
              <TurnosList />
            </PrivateRoute>
          }
        />
        <Route
          path="/turnos-crear"
          element={
            <PrivateRoute>
              <TurnosFormPage />
            </PrivateRoute>
          }
        />
        {/* Salas */}
        <Route
          path="/salas"
          element={
            <PrivateRoute>
              <SalasList />
            </PrivateRoute>
          }
        />
        <Route
          path="/salas-crear"
          element={
            <PrivateRoute>
              <SalasFormPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
