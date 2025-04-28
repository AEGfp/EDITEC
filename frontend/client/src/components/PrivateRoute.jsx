import { Navigate } from "react-router-dom";
import { Navigation } from "./Navigation";

export default function PrivateRoute({ children, rolesPermitidos = [] }) {
  const isAuthenticated = localStorage.getItem("accessToken");
  const stringUsuario = localStorage.getItem("usuario");
  const usuario = stringUsuario ? JSON.parse(stringUsuario) : null;

  if (!isAuthenticated || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos.length > 0) {
    const accesoPermitido = usuario.groups.some((rol) =>
      rolesPermitidos.includes(rol)
    );

    if (!accesoPermitido) {
      return <Navigate to="/acceso-denegado" replace />;
    }
  }
  return (
    <>
      <Navigation />
      <div>{children}</div>
    </>
  );
}
