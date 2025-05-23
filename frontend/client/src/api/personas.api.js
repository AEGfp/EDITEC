// personas.api.js
import { Api } from "./api";

// Ruta relativa al backend
const DIRECCION = "personas/";

export const obtenerPersonas = () => Api.get(DIRECCION);
export const obtenerPersona = (id) => Api.get(`${DIRECCION}${id}/`);
export const crearPersona = (datos) => {
    console.log("📤 Enviando datos a /api/personas/:", datos);
  
    if (!datos.nombre || !datos.apellido || !datos.ci) {
      console.error("❌ Datos incompletos: nombre, apellido o ci faltan");
    }
  
    return Api.post("personas/", datos);
  };
export const actualizarPersona = (id, datos) => Api.put(`${DIRECCION}${id}/`, datos);
export const eliminarPersona = (id) => Api.delete(`${DIRECCION}${id}/`);
