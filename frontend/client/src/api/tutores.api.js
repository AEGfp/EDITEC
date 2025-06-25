import { Api } from "./api";

const DIRECCION = "educativo/tutores/";
const periodo = sessionStorage.getItem("id_periodo");
const parametro = `?id_periodo=${periodo}`;

export const obtenerTutores = () => Api.get(`${DIRECCION}${parametro}`);

export const crearTutor = (tutor) => {
  console.log("📝 Enviando datos a /api/educativo/tutores/*", tutor);
  return Api.post(DIRECCION, tutor);
};

export const obtenerTutor = (id, params = "") =>
  Api.get(`${DIRECCION}${id}/${params}`);

export const actualizarTutor = (id, datos) => {
  console.log("🔄 Actualizando tutor:", id, datos);
  return Api.put(`${DIRECCION}${id}/`, datos);
};

export const eliminarTutor = (id) => {
  console.log("🗑️ Eliminando tutor:", id);
  return Api.delete(`${DIRECCION}${id}/`);
};
