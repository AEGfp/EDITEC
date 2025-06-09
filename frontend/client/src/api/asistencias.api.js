import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "asistencias/";

export const obtenerTodasAsistencias = () => {
  return Api.get(DIRECCION);
};

export const crearAsistencia = (infante) => {
  return Api.post(DIRECCION, infante);
};

export const obtenerAsistencia = (id) => {
  return Api.get(`${DIRECCION}${id}/`);
};

export const actualizarAsistencia = (id, datos) => {
  return Api.put(`${DIRECCION}${id}/`, datos);
};

export const marcarPresente = (id_infante) => {
  return Api.post(DIRECCION, {
    id_infante,
    estado: "presente",
  });
};

export const marcarAusente = (id_infante) => {
  return Api.post(DIRECCION, {
    id_infante,
    estado: "ausente",
  });
};

export const marcarSalida = (id) => {
  return Api.post(`${DIRECCION}${id}/marcar-salida/`);
};

export const obtenerInfantesAsignados = () => Api.get("infantes-asignados");
