import axios from "axios";

export const Api = axios.create({
  baseURL: "http://localhost:8000/api/",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

Api.interceptors.request.use(
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

Api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const solicitudOriginal = error.config;
    console.log("Dentro del interceptor");

    if (error.response?.status === 401 && !solicitudOriginal._retry) {
      solicitudOriginal._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await axios.post(
          "http://localhost:8000/api/token/refresh/",
          {
            refresh: refreshToken,
          }
        );

        const newAccessToken = res.data.access;
        localStorage.setItem("accessToken", newAccessToken);
        console.log("Dentro mas dentro");
        solicitudOriginal.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axios(solicitudOriginal);
      } catch (err) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        alert("No se pudo ingresar al sistema. Intenta otra vez");
        window.location.href = "/login";
      }
    }

    if (error.response?.status === 403) {
      //alert("No tiene los permisos necesarios para visitar esta página");
      window.location.href = "/acceso-denegado";
    }

    return Promise.reject(error);
  }
);
