// infantes.api.js
import { Api } from "./api";

// Ruta relativa al endpoint
const DIRECCION = "educativo/infantes/";
const periodo = sessionStorage.getItem("id_periodo");
const parametro = `?id_periodo=${periodo}`;

export const obtenerInfantes = () => Api.get(`${DIRECCION}${parametro}`);

export const crearInfante = (infante) => {
  console.log("📤 Enviando datos a /api/educativo/infantes/:", infante);
  return Api.post(DIRECCION, infante);
};

export const obtenerInfante = (id) => Api.get(`${DIRECCION}${id}/`);

export const actualizarInfante = (id, datos) => {
  console.log(`📤 Actualizando infante ID ${id} con:`, datos);
  return Api.put(`${DIRECCION}${id}/`, datos);
};

export const eliminarInfante = (id) => {
  console.log(`🗑️ Eliminando infante ID ${id}`);
  return Api.delete(`${DIRECCION}${id}/`);
};

// Generar PDF de la documentación de un infante específico
export const crearReporteInfante = (id) =>
  Api.get(`/educativo/reporte-documentacion/${id}/`, {
    responseType: "blob",
  });
