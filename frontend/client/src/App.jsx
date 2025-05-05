import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AccesoDenegado from "./pages/AccesoDenegado";
import rutasProtegidas from "./config/rutasProtegidas";
import PrivateRoute from "./components/PrivateRoute";

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
        <Route path="/signup" element={<SignUpPage />} />
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
