import { Navigate } from "react-router-dom";
import { Navigation } from "./Navigation";
import tienePermiso from "../utils/tienePermiso";

export default function PrivateRoute({
  children,
  entidad,
  permisoRequerido = "lectura",
  abierto = false,
}) {
  const isAuthenticated = localStorage.getItem("accessToken");
  const stringUsuario = localStorage.getItem("usuario");
  const usuario = stringUsuario ? JSON.parse(stringUsuario) : null;

  if (!isAuthenticated || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!abierto) {
    const puedeAcceder = tienePermiso(entidad, permisoRequerido);

    if (!puedeAcceder) {
      return <Navigate to="/acceso-denegado" replace />;
    }
  }

  /*  if (rolesPermitidos.length > 0) {
    // console.log("Usuario: " + usuario.groups);
    //console.log("Permitidos: " + rolesPermitidos);

    const accesoPermitido = usuario.groups.some((rol) =>
      rolesPermitidos.includes(rol)
    );

    if (!accesoPermitido) {
      return <Navigate to="/acceso-denegado" replace />;
    }
  }*/
  return (
    <>
      <Navigation />
      <div>{children}</div>
    </>
  );
}
