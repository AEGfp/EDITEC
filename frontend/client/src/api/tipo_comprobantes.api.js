import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "tipo-comprobantes/";

export const obtenerTodosTiposComprobantes = () => {
  return Api.get(DIRECCION);
};

export const crearTipoComprobante = (tipoComprobante) => {
  return Api.post(DIRECCION, tipoComprobante);
};

export const obtenerTipoComprobante = (id) => {
  return Api.get(`${DIRECCION}${id}/`);
};

export const eliminarTipoComprobante = (id) => {
  return Api.delete(`${DIRECCION}${id}/`);
};

export const actualizarTipoComprobante= (id, datos) => {
  return Api.put(`${DIRECCION}${id}/`, datos);
};
