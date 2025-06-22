import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "informes/";
const periodo = sessionStorage.getItem("id_periodo");
const parametro = `?id_periodo=${periodo}`;

export const obtenerTodosInformes = () => {
  return Api.get(`${DIRECCION}${parametro}`);
};

export const obtenerTodosTiposInforme = () => {
  return Api.get("tipo-informe/");
};

export const crearInforme = (informe) => {
  return Api.post(DIRECCION, informe);
};

export const obtenerInforme = (id) => {
  return Api.get(`${DIRECCION}${id}/`);
};

export const eliminarInforme = (id) => {
  return Api.delete(`${DIRECCION}${id}/`);
};

export const actualizarInforme = (id, datos) => {
  return Api.put(`${DIRECCION}${id}/`, datos);
};

export const crearReporteInforme = (id) => {
  return Api.get("reporte-informe/", {
    params: { id: id },
    responseType: "blob",
  });
};
