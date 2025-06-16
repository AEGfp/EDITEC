import { Api } from "./api";

// Endpoint para transferencia de infantes
const ENDPOINT_INFANTE = "educativo/transferir-infante/";
export const transferirInfante = (data) => Api.post(ENDPOINT_INFANTE, data);

// Endpoint para transferencia de profesores
const ENDPOINT_PROFESOR = "educativo/transferir-profesor/";
export const transferirProfesor = (data) => Api.post(ENDPOINT_PROFESOR, data);
