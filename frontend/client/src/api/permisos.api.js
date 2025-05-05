import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "permisos/";

export const obtenerTodosPermisos = () => {
  return Api.get(DIRECCION);
};

export const crearPermiso = (permiso) => {
  return Api.post(DIRECCION, permiso);
};

export const obtenerPermiso = (id) => {
  return Api.get(`${DIRECCION}${id}/`);
};

export const eliminarPermiso = (id) => {
  return Api.delete(`${DIRECCION}${id}/`);
};

export const actualizarPermiso = (id, datos) => {
  return Api.put(`${DIRECCION}${id}/`, datos);
};
