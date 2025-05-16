import { Api } from "./api";

const DIRECCION = "educativo/tutores/";

export const obtenerTutores = () => Api.get(DIRECCION);

export const crearTutor = (tutor) => {
  console.log("📝 Enviando datos a /api/educativo/tutores/*", tutor);
  return Api.post(DIRECCION, tutor);
};

export const obtenerTutor = (id) => Api.get(`${DIRECCION}${id}/`);

export const actualizarTutor = (id, datos) => {
  console.log("🔄 Actualizando tutor:", id, datos);
  return Api.put(`${DIRECCION}${id}/`, datos);
};

export const eliminarTutor = (id) => {
  console.log("🗑️ Eliminando tutor:", id);
  return Api.delete(`${DIRECCION}${id}/`);
};
