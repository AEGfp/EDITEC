// inscripciones.api.js
import { Api } from "./api";

// Ruta relativa del recurso
const DIRECCION = "inscripciones/";
const periodo = sessionStorage.getItem("id_periodo");
const parametro = `?id_periodo=${periodo}`;

export const obtenerInscripciones = () => Api.get(DIRECCION);
export const obtenerInscripcionesActuales = (periodo) =>
  Api.get(`${DIRECCION}actual/`, {
    params: {
      id_periodo: periodo,
    },
  });

export const limpiarInscripciones = () =>
  Api.post(`${DIRECCION}limpiar-inscripciones/${parametro}`);
export const crearInscripcion = (inscripcion, config = {}) =>
  Api.post("inscripciones-crear/", inscripcion, config);
export const crearInscripcionExistente = (inscripcion, config = {}) =>
  Api.post("inscripciones-crear-existente/", inscripcion, config);

export const obtenerInscripcion = (id) => Api.get(`${DIRECCION}${id}/`);
export const actualizarInscripcion = (id, datos) =>
  Api.put(`${DIRECCION}${id}/`, datos);
export const eliminarInscripcion = (id) => Api.delete(`${DIRECCION}${id}/`);
export const aceptarInscripcion = (id) =>
  Api.patch(`${DIRECCION}${id}/`, { estado: "aprobada" });
export const rechazarInscripcion = (id) =>
  Api.patch(`${DIRECCION}${id}/`, { estado: "rechazada" });
export const crearReporteInscripcion = ({
  estado_filtro,
  fecha_desde,
  fecha_hasta,
  id_tutor,
  id_infante,
} = {}) =>
  Api.get("reporte-inscripciones/", {
    params: {
      estado_filtro,
      fecha_desde,
      fecha_hasta,
      id_tutor,
      id_infante,
    },
    responseType: "blob",
  });
