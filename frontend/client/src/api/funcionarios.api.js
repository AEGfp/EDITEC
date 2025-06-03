// personas.api.js
import { Api } from "./api";

// Ruta relativa al backend
const DIRECCION = "funcionarios/";

export const obtenerFuncionarios = () => Api.get(DIRECCION);
export const crearFuncionario = (data) => axios.post("/register/", data);
export const actualizarFuncionario = (id, data) =>
  axios.put(`/usuarios/${id}/`, data);
export const eliminarFuncioario = (id) => axios.delete(`/usuarios/${id}/`);
