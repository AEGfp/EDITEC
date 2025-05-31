import { loginApi } from "../api/login.api";

export async function loginUsuario({
  username,
  password,
  setError,
  setLoading,
}) {
  setError?.("");
  setLoading?.(true);

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("usuario");

  try {
    const response = await loginApi({ username, password });
    if (response.data.access && response.data.refresh) {
      console.log(response.data.user);
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      localStorage.setItem("usuario", JSON.stringify(response.data.user));
    }
    return response;
  } catch (err) {
    setError?.("Contraseña o usuario inválidos");
    console.error("Error de login: ", err);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("usuario");
  } finally {
    setLoading?.(false);
  }
}
