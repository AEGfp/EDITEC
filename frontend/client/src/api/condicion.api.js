import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "condiciones/";

export const obtenerTodasCondiciones = () => {
  return Api.get(DIRECCION);
};

export const crearCondicion = (condicion) => {
  return Api.post(DIRECCION, condicion);
};

export const obtenerCondicion = (id) => {
  return Api.get(`${DIRECCION}${id}/`);
};

export const eliminarCondicion = (id) => {
  return Api.delete(`${DIRECCION}${id}/`);
};

export const actualizarCondicion= (id, datos) => {
  return Api.put(`${DIRECCION}${id}/`, datos);
};
