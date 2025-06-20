import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../components/images/5235784.png";
import { loginUsuario } from "../utils/loginUsuario";
import { puedeInscribirse, obtenerUltimoPeriodo } from "../api/periodos.api";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inscripcionesAbiertas, setInscripcionesAbiertas] = useState(false);
  const [verificacionError, setVerificacionError] = useState("");
  const navigate = useNavigate();

  const location = useLocation();
  const desdeInscripcion = location.state?.desdeInscripcion || false;

  useEffect(() => {
    async function verificar() {
      try {
        setVerificacionError("");
        const res = await puedeInscribirse();
        setInscripcionesAbiertas(res.data.puede_inscribirse);

        const periodo = await obtenerUltimoPeriodo();
        sessionStorage.setItem("id_periodo", periodo.data.id);
      } catch (error) {
        console.error("Error al verificar inscripciones:", error);
        setVerificacionError(
          "No se pudo verificar el estado de inscripción o el periodo. Intenta más tarde."
        );
      }
    }

    verificar();
  }, []);

  const login = async (event) => {
    event.preventDefault();
    const res = await loginUsuario({
      username,
      password,
      setError,
      setLoading,
    });
    if (res) {
      if (desdeInscripcion) {
        navigate("/realizar-inscripcion", { state: { omitirUsuario: true } });
      } else {
        navigate("/home");
      }
    }
  };

  return (
    <div className="contenedor-centrar">
      <div className="formulario">
        <div className="formulario-dentro">
          <form onSubmit={login}>
            <h2 className="formulario-titulo">Iniciar Sesión</h2>
            <div className="flex items-center justify-center">
              <img
                src={logo}
                alt="Logo"
                style={{ width: "100px", height: "auto" }}
              />
            </div>
            <label className="formulario-elemento">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="formulario-input"
            />

            <label className="formulario-elemento">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="formulario-input"
            />
            <div className="formulario-lista pt-8">
              <button
                type="submit"
                disabled={loading}
                className="boton-guardar"
              >
                {loading
                  ? "Ingresando..."
                  : desdeInscripcion
                  ? "Siguiente"
                  : "Ingresar"}
              </button>
              <br />
              {!desdeInscripcion && (
                <>
                  {/*  <button
                    className="boton-detalles"
                    onClick={() => navigate("/signup-falso")}
                    type="button"
                  >
                    Sign Up
                  </button>*/}
                  <br />
                  <br />
                  {inscripcionesAbiertas && (
                    <button
                      className="boton-editar"
                      onClick={() => navigate("/iniciar-inscripcion")}
                      type="button"
                    >
                      Inscribir
                    </button>
                  )}
                </>
              )}
            </div>
          </form>
          {verificacionError && (
            <p className="mensaje-error">{verificacionError}</p>
          )}
          {error && <p className="mensaje-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
