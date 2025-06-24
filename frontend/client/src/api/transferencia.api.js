import { Api } from "./api";

const DIRECCION = "educativo/";
const periodo = sessionStorage.getItem("id_periodo");
const parametro = `?periodo_id=${periodo}`;

// Transferencia de Infante
export const transferirInfante = (data) =>
  Api.post(`${DIRECCION}transferir-infante/`, data);

// Transferencia de Profesor
export const transferirProfesor = (data) =>
  Api.post(`${DIRECCION}transferir-profesor/`, data);

// Obtener todas las transferencias del periodo actual (para tabla)
export const obtenerTransferencias = () =>
  Api.get(`${DIRECCION}reporte-transferencias/${parametro}`);

// Generar reporte PDF de transferencias por periodo
export const crearReporteTransferencias = ({ periodo_id } = {}) => {
  const id = periodo_id || sessionStorage.getItem("id_periodo");
  return Api.get(`${DIRECCION}reporte-transferencias/`, {
    params: { periodo_id: id },
    responseType: "blob",
  });
};
