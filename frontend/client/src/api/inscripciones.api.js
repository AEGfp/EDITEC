// inscripciones.api.js
import { Api } from "./api";

// Ruta relativa del recurso
const DIRECCION = "inscripciones/";

export const obtenerInscripciones = () => Api.get(DIRECCION);
export const crearInscripcion = (inscripcion) =>
  Api.post("inscripciones-crear/", inscripcion);
export const crearInscripcionExistente = (inscripcion) =>
  Api.post("inscripciones-crear-existente/", inscripcion);
export const obtenerInscripcion = (id) => Api.get(`${DIRECCION}${id}/`);
export const actualizarInscripcion = (id, datos) =>
  Api.put(`${DIRECCION}${id}/`, datos);
export const eliminarInscripcion = (id) => Api.delete(`${DIRECCION}${id}/`);
export const aceptarInscripcion = (id) =>
  Api.patch(`${DIRECCION}${id}/`, { estado: "aprobada" });
export const rechazarInscripcion = (id) =>
  Api.patch(`${DIRECCION}${id}/`, { estado: "rechazada" });
