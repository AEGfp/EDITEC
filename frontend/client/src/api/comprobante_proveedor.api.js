import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "comprobantes/";

export const obtenerTodosComprobantes = () => {
  return Api.get(DIRECCION);
};

export const crearComprobante = (comprobante) => {
  return Api.post(DIRECCION, comprobante);
};

export const obtenerComprobante = (id) => {
  return Api.get(`${DIRECCION}${id}/`);
};

export const eliminarComprobante = (id) => {
  return Api.delete(`${DIRECCION}${id}/`);
};

export const actualizarComprobante = (id, datos) => {
  return Api.put(`${DIRECCION}${id}/`, datos);
};
