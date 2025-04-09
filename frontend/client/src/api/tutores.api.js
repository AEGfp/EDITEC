import axios from "axios";

const tutoresApi = axios.create({
  baseURL: "http://localhost:8000/api/educativo/tutores/",
});

tutoresApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const obtenerTutores = () => tutoresApi.get("/");
export const crearTutor = (tutor) => tutoresApi.post("/", tutor);
export const obtenerTutor = (id) => tutoresApi.get(`/${id}/`);
export const actualizarTutor = (id, datos) => tutoresApi.put(`/${id}/`, datos);
export const eliminarTutor = (id) => tutoresApi.delete(`/${id}/`);
