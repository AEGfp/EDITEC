import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "periodos/";

export const crearPeriodoInscripcion = (periodo) => {
  return Api.post(DIRECCION, periodo);
};

export const obtenerPeriodoActivo = () => {
  return Api.get(`${DIRECCION}activo/`);
};

export const cerrarPeriodo = (id) => {
  return Api.post(`${DIRECCION}${id}/cerrar/`);
};

export const obtenerUltimoPeriodo = () => {
  return Api.get(`${DIRECCION}ultimo/`);
};

export const puedeInscribirse = () => {
  return Api.get(`${DIRECCION}puede_inscribirse/`);
};
