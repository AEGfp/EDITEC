import { Api } from "./api";

// Cambiar según la url del backend
const DIRECCION = "usuarios/";

export const obtenerUsuarios = () => {
  return Api.get(DIRECCION);
};

export const obtenerUsuario = (id) => {
  return Api.get(`${DIRECCION}${id}/`);
};

export const crearUsuario = (usuario) => {
  return Api.post("register/", usuario);
};

export const actualizarUsuario = (id, datos) => {
  return Api.patch(`${DIRECCION}${id}/`, datos);
};

export const eliminarUsuario = (id) => {
  return Api.delete(`${DIRECCION}${id}/`);
};
