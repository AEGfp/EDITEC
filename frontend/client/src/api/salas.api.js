// salas.api.js
import { Api } from "./api";

// Ruta relativa dentro de la API
const DIRECCION = "educativo/salas/";

export const obtenerSalas = () => Api.get(DIRECCION);
export const obtenerSalasPublicas = () => Api.get("educativo/salas-publicas/");
export const crearSala = (sala) => Api.post(DIRECCION, sala);
export const obtenerSala = (id) => Api.get(`${DIRECCION}${id}/`);
export const actualizarSala = (id, datos) =>
  Api.put(`${DIRECCION}${id}/`, datos);
export const eliminarSala = (id) => Api.delete(`${DIRECCION}${id}/`);
