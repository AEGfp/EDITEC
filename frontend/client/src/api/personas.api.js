import axios from "axios";

const personasApi = axios.create({
  baseURL: "http://localhost:8000/api/personas/",
});

// Interceptor para agregar token JWT
personasApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// CRUD

// 🔍 Obtener todas las personas
export const obtenerPersonas = () => personasApi.get("/");

// 🔍 Obtener una persona por ID
export const obtenerPersona = (id) => personasApi.get(`/${id}/`);

// ➕ Crear una nueva persona
export const crearPersona = (datos) => personasApi.post("/", datos);

// 📝 Actualizar persona por ID
export const actualizarPersona = (id, datos) => personasApi.put(`/${id}/`, datos);

// 🗑️ Eliminar persona por ID
export const eliminarPersona = (id) => personasApi.delete(`/${id}/`);
