import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { PermisosPage } from "./pages/PermisosPage";
import { PermisosFormPage } from "./pages/PermisosFormPage";
import { Navigation } from "./components/Navigation";
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

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
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
        {/* Salas */}
        <Route
          path="/salas"
          element={
            <PrivateRoute>
              <Navigation />
              <SalasList />
            </PrivateRoute>
          }
        />
        <Route
          path="/salas-crear"
          element={
            <PrivateRoute>
              <Navigation />
              <SalasFormPage />
            </PrivateRoute>
          }
        />
        {/* Turnos */}
        <Route
          path="/turnos"
          element={
            <PrivateRoute>
              <Navigation />
              <TurnosList />
            </PrivateRoute>
          }
        />
        <Route
          path="/turnos-crear"
          element={
            <PrivateRoute>
              <Navigation />
              <TurnosFormPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/turnos-id"
          element={
            <PrivateRoute>
              <Navigation />
              <TurnosFormPage />
            </PrivateRoute>
          }
        />
        {/* Tutores */}
        <Route
          path="/tutores"
          element={
            <PrivateRoute>
              <Navigation />
              <TutoresList />
            </PrivateRoute>
          }
        />
        <Route
          path="/tutores-crear"
          element={
            <PrivateRoute>
              <Navigation />
              <TutoresFormPage />
            </PrivateRoute>
          }
        />
        {/* Turnos */}
        <Route
          path="/turnos"
          element={
            <PrivateRoute>
              <Navigation />
              <TurnosList />
            </PrivateRoute>
          }
        />
        <Route
          path="/turnos-crear"
          element={
            <PrivateRoute>
              <Navigation />
              <TurnosFormPage />
            </PrivateRoute>
          }
        />
        {/* Salas */}
        <Route
          path="/salas"
          element={
            <PrivateRoute>
              <Navigation />
              <SalasList />
            </PrivateRoute>
          }
        />
        <Route
          path="/salas-crear"
          element={
            <PrivateRoute>
              <Navigation />
              <SalasFormPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
