/*import axios from "axios"

export const obtenerTodasEmpresas = () => {
    return axios.get('http://localhost:8000/api/empresas/')
}*/
import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "empresas/";

export const obtenerTodasEmpresas = () => {
  return Api.get(DIRECCION);
};

export const crearEmpresa = (empresa) => {
  return Api.post(DIRECCION, empresa);
};

export const obtenerEmpresa = (id) => {
  return Api.get(`${DIRECCION}${id}/`);
};

export const eliminarEmpresa = (id) => {
  return Api.delete(`${DIRECCION}${id}/`);
};

export const actualizarEmpresa = (id, datos) => {
  return Api.put(`${DIRECCION}${id}/`, datos);
};
