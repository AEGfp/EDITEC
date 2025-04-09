import axios from "axios";

const turnosApi = axios.create({
  baseURL: "http://localhost:8000/api/educativo/turnos/",
});

turnosApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Funciones exportadas
export const obtenerTurnos = () => turnosApi.get("/");
export const crearTurno = (turno) => turnosApi.post("/", turno);
export const obtenerTurno = (id) => turnosApi.get(`/${id}/`);
export const actualizarTurno = (id, datos) => turnosApi.put(`/${id}/`, datos);
export const eliminarTurno = (id) => turnosApi.delete(`/${id}/`);
