import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "locales/";

export const obtenerTodasSucursales = () => {
  return Api.get(DIRECCION);
};

export const crearSucursal = (sucursal) => {
  return Api.post(DIRECCION, sucursal);
};

export const obtenerSucursal = (id) => {
  return Api.get(`${DIRECCION}${id}/`);
};

export const eliminarSucursal = (id) => {
  return Api.delete(`${DIRECCION}${id}/`);
};

export const actualizarSucursal = (id, datos) => {
  return Api.put(`${DIRECCION}${id}/`, datos);
};
