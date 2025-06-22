import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "cuotas/";
const PORINFANTE = "cuotas-por-infante/";
const CUOTAS = 'generar-cuotas/';
const REPORTE = "reporte-cuotas/";

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

// Para generar las cuotas de los infantes
export const generarCuota = (inscripcion) => {
  const payload = { id_infante: inscripcion.id_infante };
  console.log("Enviando a generarCuota:", payload); // Depuración
  return Api.post(CUOTAS, inscripcion);
};

export const obtenerSaldosCuotasConFiltros = async (filtros) => {
  try {
    const response = await Api.get(DIRECCION, { params: filtros });
    console.log("Respuesta de obtenerSaldosCuotasConFiltros:", response.data);
    return response;
  } catch (error) {
    console.error("Error en obtenerSaldosCuotasConFiltros:", error.response?.data || error.message);
    throw error;
  }
};

export const descargarReporteCuotasPDF = async (filtros) => {
  try {
    const response = await Api.get(REPORTE, {
      params: filtros,
      responseType: 'blob',
    });
    console.log("Respuesta de descargarReporteCuotasPDF:", response);
    return response;
  } catch (error) {
    console.error("Error en descargarReporteCuotasPDF:", error.response?.data || error.message);
    throw error;
  }
};