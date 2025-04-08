import axios from "axios";

const infantesApi = axios.create({
  baseURL: "http://localhost:8000/api/educativo/infantes/",
});

// Agregar token automáticamente
infantesApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const obtenerInfantes = () => infantesApi.get("/");
export const crearInfante = (infante) => infantesApi.post("/", infante);
export const obtenerInfante = (id) => infantesApi.get(`/${id}/`);
export const actualizarInfante = (id, datos) => infantesApi.put(`/${id}/`, datos);
export const eliminarInfante = (id) => infantesApi.delete(`/${id}/`);
