import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/login.api";
import logo from "../components/images/5235784.png";

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
        navigate("/permisos");
      }
    } catch (err) {
      setError("Contraseña o usuario inválidos");
      console.error("Error de login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "2rem",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 0 15px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <img
            src={logo}
            alt="Logo"
            style={{ width: "100px", height: "auto" }}
          />
          <h2 style={{ fontSize: "1.5rem", color: "#333", marginTop: "1rem" }}>
            Iniciar Sesión
          </h2>
        </div>

        <form onSubmit={login}>
          <label
            style={{ display: "block", marginBottom: "0.5rem", color: "#555" }}
          >
            Usuario
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            style={{
              width: "100%",
              padding: "0.5rem",
              marginBottom: "1rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />

          <label
            style={{ display: "block", marginBottom: "0.5rem", color: "#555" }}
          >
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{
              width: "100%",
              padding: "0.5rem",
              marginBottom: "1rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {
          // !!! Borrar al final
        }
        <br />
        <button
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "green",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </button>

        {error && (
          <p
            style={{
              color: "red",
              marginTop: "1rem",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
