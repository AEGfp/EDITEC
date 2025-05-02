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
            <PrivateRoute abierto>
              <HomePage></HomePage>
            </PrivateRoute>
          }
        />
        <Route
          path="/permisos"
          element={
            <PrivateRoute entidad="permisos">
              <PermisosPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/permisos-crear"
          element={
            <PrivateRoute entidad="permisos" permisoRequerido="escritura">
              <PermisosFormPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/permisos/:id"
          element={
            <PrivateRoute entidad="permisos">
              <PermisosFormPage />
            </PrivateRoute>
          }
        />

        {/* 🧒 Infantes */}
        <Route
          path="/infantes"
          element={
            <PrivateRoute abierto>
              <InfantesList />
            </PrivateRoute>
          }
        />
        <Route
          path="/infantes-crear"
          element={
            <PrivateRoute abierto>
              <InfanteForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/infantes/:id"
          element={
            <PrivateRoute abierto>
              <InfanteForm />
            </PrivateRoute>
          }
        />
        {/* Salas */}
        <Route
          path="/salas"
          element={
            <PrivateRoute abierto>
              <SalasList />
            </PrivateRoute>
          }
        />
        <Route
          path="/salas-crear"
          element={
            <PrivateRoute abierto>
              <SalasFormPage />
            </PrivateRoute>
          }
        />
        {/* Turnos */}
        <Route
          path="/turnos"
          element={
            <PrivateRoute abierto>
              <TurnosList />
            </PrivateRoute>
          }
        />
        <Route
          path="/turnos-crear"
          element={
            <PrivateRoute abierto>
              <TurnosFormPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/turnos-id"
          element={
            <PrivateRoute abierto>
              <TurnosFormPage />
            </PrivateRoute>
          }
        />
        {/* Tutores */}
        <Route
          path="/tutores"
          element={
            <PrivateRoute abierto>
              <TutoresList />
            </PrivateRoute>
          }
        />
        <Route
          path="/tutores-crear"
          element={
            <PrivateRoute abierto>
              <TutoresFormPage />
            </PrivateRoute>
          }
        />
        {/* Turnos */}
        <Route
          path="/turnos"
          element={
            <PrivateRoute abierto>
              <TurnosList />
            </PrivateRoute>
          }
        />
        <Route
          path="/turnos-crear"
          element={
            <PrivateRoute abierto>
              <TurnosFormPage />
            </PrivateRoute>
          }
        />
        {/* Salas */}
        <Route
          path="/salas"
          element={
            <PrivateRoute abierto>
              <SalasList />
            </PrivateRoute>
          }
        />
        <Route
          path="/salas-crear"
          element={
            <PrivateRoute abierto>
              <SalasFormPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
