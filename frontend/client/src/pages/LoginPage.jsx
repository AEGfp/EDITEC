import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Api } from "../api/api/";
import { loginApi } from "../api/login.api";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginApi({ username, password });
      if (response.data.access) {
        localStorage.setItem("accessToken", response.data.access);
        navigate("/permisos");
      }
    } catch (err) {
      setError("Contraseña o usario inválidos");
      console.error("Error de login:", err);
    } finally {
      setLoading(false);
    }
  };
  /*
  const handleSignUp = () => {
    navigate("/signup");
  };*/

  return (
    <div className="flex items-center justify-center h-screen text-xl">
      <div className="p-4 bg-white rounded shadow-md w-full max-w-lg">
        <h2 className="mb-4 text-2xl text-black text-left px-1 ">Login</h2>
        <form onSubmit={login}>
          <div className="text-left  mb-1 text-black pb-1 px-1">
            <h3>Usuario: </h3>
          </div>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="bg-slate-200 rounded w-full text-black px-1"
          />

          <div className="text-left  mb-1 text-black pt-4 pb-1 px-1">
            <h3>Contraseña: </h3>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="bg-slate-200 rounded w-full text-black px-1"
          />

          <button
            className="bg-blue-500 text-white w-full p-2 rounded mt-6 cursor-pointer"
            type="submit"
          >
            Ingresar
          </button>
        </form>
        {/* <div className="flex justify-end mt-2">
          <button
            onClick={handleSignUp}
            className="text-sm text-blue-400 w-auto "
          >
            Crear Cuenta
          </button>
        </div>*/}
        {error && <p className="text-red-600 font-bold text-sm">{error}</p>}
      </div>
    </div>
  );
}
