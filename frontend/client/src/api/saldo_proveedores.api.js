import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "saldos/";

export const obtenerTodosSaldos = () => {
  return Api.get(DIRECCION);
};

export const crearSaldo = (saldo) => {
  return Api.post(DIRECCION, saldo);
};

export const obtenerSaldo = (id) => {
  return Api.get(`${DIRECCION}${id}/`);
};

export const eliminarSaldo = (id) => {
  return Api.delete(`${DIRECCION}${id}/`);
};

export const actualizarSaldo= (id, datos) => {
  return Api.put(`${DIRECCION}${id}/`, datos);
};
