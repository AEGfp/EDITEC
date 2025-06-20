/*import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "saldos/";

export const obtenerTodosSaldos = () => {
  return Api.get(DIRECCION);
};

export const crearSaldo = (saldo) => {
  return Api.post(DIRECCION, saldo);
};

export const obtenerSaldo = (id) => {
  return Api.get(`${DIRECCION}${id}/`);
};

export const eliminarSaldo = (id) => {
  return Api.delete(`${DIRECCION}${id}/`);
};

export const actualizarSaldo= (id, datos) => {
  return Api.put(`${DIRECCION}${id}/`, datos);
};
*/

import { Api } from "./api";

const DIRECCION = "saldos/";


// CRUD básicos (pueden quedar igual)
export const crearSaldo = (saldo) => Api.post(DIRECCION, saldo);
export const obtenerSaldo = (id) => Api.get(`${DIRECCION}${id}/`);
export const eliminarSaldo = (id) => Api.delete(`${DIRECCION}${id}/`);
export const actualizarSaldo = (id, datos) => Api.put(`${DIRECCION}${id}/`, datos);
export const obtenerTodosSaldos = () => {
  return Api.get(DIRECCION);
};

export const obtenerSaldosConFiltros = (filtros = {}) => {
  const params = new URLSearchParams();

  if (filtros.fecha_desde) params.append("fecha_desde", filtros.fecha_desde);
  if (filtros.fecha_hasta) params.append("fecha_hasta", filtros.fecha_hasta);
  if (filtros.proveedor_id) params.append("proveedor_id", filtros.proveedor_id);

  const queryString = params.toString();

  return Api.get(`${DIRECCION}${queryString ? `?${queryString}` : ""}`);
};

// Descargar PDF del reporte con filtros
export const descargarReporteSaldosPDF = (filtros = {}) => {
  const params = new URLSearchParams();

  if (filtros.fecha_desde) params.append("fecha_desde", filtros.fecha_desde);
  if (filtros.fecha_hasta) params.append("fecha_hasta", filtros.fecha_hasta);
  if (filtros.proveedor_id) params.append("proveedor_id", filtros.proveedor_id);

  const queryString = params.toString();

  return Api.get(`reporte-saldos-pdf/${queryString ? `?${queryString}` : ""}`, {
    responseType: "blob",
  });
};