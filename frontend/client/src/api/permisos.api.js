import axios from "axios";

const permisosApi = axios.create({
  baseURL: "http://localhost:8000/api/permisos/",
});
/*
const permisosApi = axios.create({
  baseURL: "http://localhost:8000/api/permisos/",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
permisosApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

*/

export const obtenerTodosPermisos = () => {
  return permisosApi.get("/");
};

export const crearPermiso = (permiso) => {
  return permisosApi.post("/", permiso);
};

export const obtenerPermiso = (id) => {
  return permisosApi.get(`/${id}/`);
};

export const eliminarPermiso = (id) => {
  return permisosApi.delete(`/${id}/`);
};

export const actualizarPermiso = (id, datos) => {
  return permisosApi.put(`/${id}/`, datos);
};
