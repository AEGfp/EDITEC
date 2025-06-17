import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "cuotas/";
const PORINFANTE = "cuotas-por-infante/";

export const obtenerTodasCuotas = () => {
  return Api.get(DIRECCION);
};

export const crearCuota = (cuota) => {
  return Api.post(DIRECCION, cuota);
};

export const obtenerCuota = (id) => {
  return Api.get(`${PORINFANTE}${id}/`);
};

export const eliminarCuota = (id) => {
  return Api.delete(`${PORINFANTE}${id}/`);
};

export const actualizarCuota = (id, datos) => {
  return Api.put(`${PORINFANTE}${id}/`, datos);
};

export const obtenerResumenCuotasPorInfante = (idInfante) =>
  Api.get(`cuotas/resumen-json/${idInfante}/`);


// Descargar PDF resumen de cuotas por infante
export const descargarResumenCuotasPDF = (idInfante) =>
  Api.get(`cuotas/resumen-cobros/${idInfante}/`, {
    responseType: "blob",
  });


export const descargarResumenTodosLosInfantesPDF = () =>
  Api.get("cuotas/resumen-pdf-todos/", {
    responseType: "blob",
  });

