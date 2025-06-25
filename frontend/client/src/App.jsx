import {
  Routes,
  Route,
  Navigate,
  useLocation,
  BrowserRouter,
} from "react-router-dom";
import { useEffect } from "react";
import { obtenerUltimoPeriodo } from "./api/periodos.api";
import { LoginPage } from "./pages/LoginPage";
import SignUpFalso from "./pages/SignUpFalso";
import AccesoDenegado from "./pages/AccesoDenegado";
import rutasProtegidas from "./config/rutasProtegidas";
import PrivateRoute from "./components/PrivateRoute";
import RealizarInscripcionPage from "./pages/RealizarInscripcionPage";
import { EmpresasPage } from "./pages/EmpresasPage";
import { EmpresasFormPage } from "./pages/EmpresasFormPage";
import InicioInscripcionPage from "./pages/InicioInscripcionPage";
import OlvidasteContrasenha from "./pages/OlvidasteContrasenha";
import CambiarContrasenha from "./pages/CambiarContrasenha";

export function App() {
  const location = useLocation();

  const actualizarPeriodo = async () => {
    try {
      const res = await obtenerUltimoPeriodo();
      const periodoActual = res.data.id;

      const periodoGuardado = sessionStorage.getItem("id_periodo");
      console.log("Periodo guardado en sessionStorage:", periodoGuardado);
      console.log("Periodo actual obtenido:", periodoActual);
      if (periodoGuardado !== String(periodoActual)) {
        sessionStorage.setItem("id_periodo", periodoActual);
        console.log("Periodo actualizado en sessionStorage:", periodoActual);
      }
    } catch (error) {
      console.error("Error obteniendo periodo:", error);
    }
  };

  useEffect(() => {
    actualizarPeriodo();
  }, [location]);

  const obtenerRutas = (ruta) => {
    const { path, componente: Componente, entidad, permiso, publico } = ruta;

    return (
      <Route
        key={path}
        path={path}
        element={
          <PrivateRoute
            entidad={entidad}
            permisoRequerido={permiso}
            abierto={publico}
          >
            <Componente />
          </PrivateRoute>
        }
      />
    );
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/iniciar-inscripcion" element={<InicioInscripcionPage />} />
      <Route
        path="/realizar-inscripcion"
        element={<RealizarInscripcionPage />}
      />
      <Route path="/olvide-contrasenha" element={<OlvidasteContrasenha />} />
      <Route
        path="/cambiar-contrasenha/:uid/:token"
        element={<CambiarContrasenha />}
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup-falso" element={<SignUpFalso />} />
      <Route path="/acceso-denegado" element={<AccesoDenegado />} />

      {rutasProtegidas.flatMap((ruta) => {
        const subrutas = ruta.subrutas || [];
        return [obtenerRutas(ruta), ...subrutas.map(obtenerRutas)];
      })}
    </Routes>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
