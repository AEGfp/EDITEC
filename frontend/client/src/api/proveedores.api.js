import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "proveedores/";

export const obtenerTodosProveedores = () => {
  return Api.get(DIRECCION);
};

export const crearProveedor = (proveedor) => {
  return Api.post(DIRECCION, proveedor);
};

export const obtenerProveedor = (id) => {
  return Api.get(`${DIRECCION}${id}/`);
};

export const eliminarProveedor = (id) => {
  return Api.delete(`${DIRECCION}${id}/`);
};

export const actualizarProveedor= (id, datos) => {
  return Api.put(`${DIRECCION}${id}/`, datos);
};
