import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "indicadores/";

export const obtenerTodosIndicadores = () => {
  return Api.get(DIRECCION);
};

export const crearIndicador = (indicador) => {
  return Api.post(DIRECCION, indicador);
};

export const obtenerIndicador = (id) => {
  return Api.get(`${DIRECCION}${id}/`);
};

export const eliminarIndicador = (id) => {
  return Api.delete(`${DIRECCION}${id}/`);
};

export const actualizarIndicador = (id, datos) => {
  return Api.put(`${DIRECCION}${id}/`, datos);
};
