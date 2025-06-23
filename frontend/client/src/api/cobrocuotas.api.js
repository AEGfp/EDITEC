import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "cuotas/cobrar/";

export const obtenerTodasCajasCobros = () => {
  return Api.get(DIRECCION);
};

export const crearCajaCobro = (caja) => {
    return Api.post(DIRECCION, {
        cuota_id: parseInt(caja.cuota_id),
        monto_cobrado: parseInt(caja.monto_cobrado),
        metodo_pago: caja.metodo_pago,
        observacion: caja.observacion || "",
        fecha_cobro: caja.fecha_cobro,
    });
};

export const obtenerCajaCobro = (id) => {
  return Api.get(`${DIRECCION}${id}/`);
};

export const eliminarCajaCobro = (id) => {
  return Api.delete(`${DIRECCION}${id}/`);
};

export const actualizarCajaCobro = (id, datos) => {
  return Api.put(`${DIRECCION}${id}/`, datos);
};