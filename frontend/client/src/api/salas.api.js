import { Api } from "./api";

const DIRECCION = "educativo/salas/";

function getParametroPeriodo() {
  const periodo = sessionStorage.getItem("id_periodo");
  return periodo && periodo !== "null" ? `?periodo_id=${periodo}` : "";
}

export const obtenerSalas = () => Api.get(`${DIRECCION}${getParametroPeriodo()}`);
export const obtenerSalasPublicas = () =>
  Api.get(`educativo/salas-publicas/${getParametroPeriodo()}`);
export const crearSala = (sala) => Api.post(DIRECCION, sala);
export const obtenerSala = (id) => Api.get(`${DIRECCION}${id}/`);
export const actualizarSala = (id, datos) =>
  Api.put(`${DIRECCION}${id}/`, datos);
export const eliminarSala = (id) => Api.delete(`${DIRECCION}${id}/`);
