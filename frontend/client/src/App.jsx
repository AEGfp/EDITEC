import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import SignUpFalso from "./pages/SignUpFalso";
import AccesoDenegado from "./pages/AccesoDenegado";
import rutasProtegidas from "./config/rutasProtegidas";
import PrivateRoute from "./components/PrivateRoute";
import InscripcionPage from "./pages/InscripcionPage";

export function App() {
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup-falso" element={<SignUpFalso />} />
        <Route path="/realizar-inscripcion" element={<InscripcionPage />} />
        <Route path="/acceso-denegado" element={<AccesoDenegado />} />
        {rutasProtegidas.flatMap((ruta) => {
          const subrutas = ruta.subrutas || [];
          return [obtenerRutas(ruta), ...subrutas.map(obtenerRutas)];
        })}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
