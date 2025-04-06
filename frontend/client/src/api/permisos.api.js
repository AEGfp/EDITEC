import { Api } from "./api";

export const obtenerTodosPermisos = () => {
  return Api.get("permisos/");
};

export const crearPermiso = (permiso) => {
  return Api.post("permisos/", permiso);
};

export const obtenerPermiso = (id) => {
  return Api.get(`permisos/${id}/`);
};

export const eliminarPermiso = (id) => {
  return Api.delete(`permisos/${id}/`);
};

export const actualizarPermiso = (id, datos) => {
  return Api.put(`permisos/${id}/`, datos);
};
