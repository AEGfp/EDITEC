import axios from "axios";

const inscripcionesApi = axios.create({
  baseURL: "http://localhost:8000/api/educativo/inscripciones/",
});

inscripcionesApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const obtenerInscripciones = () => inscripcionesApi.get("/");
export const crearInscripcion = (inscripcion) => inscripcionesApi.post("/", inscripcion);
export const obtenerInscripcion = (id) => inscripcionesApi.get(`/${id}/`);
export const actualizarInscripcion = (id, datos) => inscripcionesApi.put(`/${id}/`, datos);
export const eliminarInscripcion = (id) => inscripcionesApi.delete(`/${id}/`);
