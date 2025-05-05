import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Navigation } from "./Navigation";
import tienePermiso from "../utils/tienePermiso";
import Sidebar from "./Sidebar";

export default function PrivateRoute({
  children,
  entidad,
  permisoRequerido = "lectura",
  abierto = false,
}) {
  const isAuthenticated = localStorage.getItem("accessToken");
  const stringUsuario = localStorage.getItem("usuario");
  const usuario = stringUsuario ? JSON.parse(stringUsuario) : null;

  const [sidebarActivo, setSidebarActivo] = useState(true);

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
    <div className="h-screen flex flex-col">
      <Navigation
        activarSidebar={() => setSidebarActivo((activo) => !activo)}
        usuario={usuario}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar abierto={sidebarActivo} />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}
