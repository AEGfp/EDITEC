// inscripciones.api.js
import { Api } from "./api";

// Ruta relativa del recurso
const DIRECCION = "inscripciones/";

export const obtenerInscripciones = () => Api.get(DIRECCION);
export const crearInscripcion = (inscripcion) =>
  Api.post(DIRECCION, inscripcion);
export const obtenerInscripcion = (id) => Api.get(`${DIRECCION}${id}/`);
export const actualizarInscripcion = (id, datos) =>
  Api.put(`${DIRECCION}${id}/`, datos);
export const eliminarInscripcion = (id) => Api.delete(`${DIRECCION}${id}/`);
