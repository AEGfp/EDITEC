import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "caja-pagos/";

export const obtenerTodasCajasPagos = () => {
  return Api.get(DIRECCION);
};

export const crearCajaPago = (caja) => {
  return Api.post(DIRECCION, caja);
};

export const obtenerCajaPago = (id) => {
  return Api.get(`${DIRECCION}${id}/`);
};

export const eliminarCajaPago = (id) => {
  return Api.delete(`${DIRECCION}${id}/`);
};

export const actualizarCajaPago = (id, datos) => {
  return Api.put(`${DIRECCION}${id}/`, datos);
};
