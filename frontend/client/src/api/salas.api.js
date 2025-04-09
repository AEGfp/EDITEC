import axios from "axios";

const salasApi = axios.create({
  baseURL: "http://localhost:8000/api/educativo/salas/",
});

// Agregar token automáticamente
salasApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const obtenerSalas = () => salasApi.get("/");
export const crearSala = (sala) => salasApi.post("/", sala);
export const obtenerSala = (id) => salasApi.get(`/${id}/`);
export const actualizarSala = (id, datos) => salasApi.put(`/${id}/`, datos);
export const eliminarSala = (id) => salasApi.delete(`/${id}/`);
