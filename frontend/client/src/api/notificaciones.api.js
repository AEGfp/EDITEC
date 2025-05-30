import { Api } from "./api";

const DIRECCION = "/notificaciones/";

export const obtenerNotificaciones = () => Api.get(`${DIRECCION}listar/`);

export const crearNotificacion = (notificacion) => {
  console.log("📝 Enviando datos a /api/notificaciones/*", notificacion);
  return Api.post(DIRECCION, notificacion);
};

export const obtenerNotificacion = (id) => Api.get(`${DIRECCION}${id}/`);

export const actualizarNotificacion = (id, datos) => {
  console.log("🔄 Actualizando notificación:", id, datos);
  return Api.put(`${DIRECCION}${id}/`, datos);
};

export const eliminarNotificacion = (id) => {
  console.log("🗑️ Eliminando notificación:", id);
  return Api.delete(`${DIRECCION}${id}/`);
};
