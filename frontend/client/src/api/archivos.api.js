import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "archivos/";

export const obtenerTodosArchivos = () => {
  return Api.get(`${DIRECCION}?fields=descripcion`);
};

export const crearArchivo = (archivo) => {
  return Api.post(DIRECCION, archivo, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const obtenerArchivo = (id) => {
  return Api.get(`${DIRECCION}${id}/`);
};

export const eliminarArchivo = (id) => {
  return Api.delete(`${DIRECCION}${id}/`);
};

export const actualizarArchivo = (id, datos) => {
  return Api.put(`${DIRECCION}${id}/`, datos);
};
