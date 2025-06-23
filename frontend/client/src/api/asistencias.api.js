import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "asistencias/";
const periodo = sessionStorage.getItem("id_periodo");
const parametro = `?id_periodo=${periodo}`;

export const obtenerTodasAsistencias = () => {
  return Api.get(`${DIRECCION}${parametro}`);
};

export const crearAsistencia = (infante) => {
  return Api.post(DIRECCION, infante);
};

export const obtenerAsistencia = (id) => {
  return Api.get(`${DIRECCION}${id}/${parametro}`);
};

export const actualizarAsistencia = (id, datos) => {
  return Api.patch(`${DIRECCION}${id}/`, datos);
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

export const crearReporteAsistencia = ({
  fecha_desde,
  fecha_hasta,
  estado,
  id_infante,
  id_periodo = sessionStorage.getItem("id_periodo"),
} = {}) =>
  Api.get("reporte-asistencias/", {
    params: {
      estado,
      fecha_desde,
      fecha_hasta,
      id_infante,
      id_periodo,
    },
    responseType: "blob",
  });

export const obtenerInfantesAsignados = () =>
  Api.get(`infantes-asignados/${parametro}`);
