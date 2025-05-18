// personas.api.js
import { Api } from "./api";

// Ruta relativa al backend
const DIRECCION = "personas/";

export const obtenerPersonas = () => Api.get(DIRECCION);
export const obtenerPersona = (id) => Api.get(`${DIRECCION}${id}/`);
export const crearPersona = (datos) => Api.post(DIRECCION, datos);
export const actualizarPersona = (id, datos) => Api.put(`${DIRECCION}${id}/`, datos);
export const eliminarPersona = (id) => Api.delete(`${DIRECCION}${id}/`);
