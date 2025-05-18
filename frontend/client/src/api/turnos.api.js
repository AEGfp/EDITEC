// turnos.api.js
import { Api } from "./api";

// Ruta relativa a la baseURL
const DIRECCION = "educativo/turnos/";

export const obtenerTurnos = () => Api.get(DIRECCION);
export const crearTurno = (turno) => Api.post(DIRECCION, turno);
export const obtenerTurno = (id) => Api.get(`${DIRECCION}${id}/`);
export const actualizarTurno = (id, datos) => Api.put(`${DIRECCION}${id}/`, datos);
export const eliminarTurno = (id) => Api.delete(`${DIRECCION}${id}/`);
