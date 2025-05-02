import permisosRoles from "../config/permisosRoles";

export default function tienePermiso(entidad, tipoPermiso = "lectura") {
  const rolesUsuario =
    JSON.parse(localStorage.getItem("usuario"))?.groups || [];

  const permisosEntidad = permisosRoles[entidad];
  if (!permisosEntidad) {
    return false;
  }

  const rolesPermitidos = permisosEntidad[tipoPermiso] || [];

  return rolesUsuario.some((rol) => rolesPermitidos.includes(rol));
}
