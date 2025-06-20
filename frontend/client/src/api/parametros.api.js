import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "parametros/";

export const obtenerTodosParametros = () => {
  return Api.get(DIRECCION);
};

export const crearParametro = (parametro) => {
  return Api.post(DIRECCION, parametro);
};

export const obtenerParametro = (id) => {
  return Api.get(`${DIRECCION}${id}/`);
};

export const eliminarParametro = (id) => {
  return Api.delete(`${DIRECCION}${id}/`);
};

export const actualizarParametro = (id, datos) => {
  return Api.put(`${DIRECCION}${id}/`, datos);
};
