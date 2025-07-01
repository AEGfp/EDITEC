import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../components/images/logo_editec.png";
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
          "No se pudo verificar el estado de inscripción. Intenta más tarde."
        );
      }
    }
    verificar();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await loginUsuario({
      username,
      password,
      setError,
      setLoading,
    });
    if (res) {
      navigate(desdeInscripcion ? "/realizar-inscripcion" : "/home", {
        state: desdeInscripcion ? { omitirUsuario: true } : undefined,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
      <div className="w-full max-w-lg p-10 space-y-8 bg-white rounded-2xl shadow-xl border-4 border-blue-200">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-blue-500">
            Inicio de Sesión
          </h2>
        </div>
        <div className="flex justify-center mb-4">
          <img
            src={logo}
            alt="Logo Editec"
            className="w-56 sm:w-64 h-auto object-contain drop-shadow-xl"
          />
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-xl font-medium text-blue-700">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-3 text-lg border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-xl font-medium text-blue-700">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 text-lg border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>

          <div className="pt-4 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 text-xl font-bold text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-blue-200/50 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex justify-center">
                  <svg
                    className="w-6 h-6 mr-2 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Procesando...
                </span>
              ) : desdeInscripcion ? (
                "Continuar a Inscripción"
              ) : (
                "Ingresar al Sistema"
              )}
            </button>

            {!desdeInscripcion && inscripcionesAbiertas && (
              <button
                type="button"
                onClick={() => navigate("/iniciar-inscripcion")}
                className="w-full px-6 py-3 text-xl font-bold text-blue-700 bg-blue-100 border-2 border-blue-300 rounded-xl hover:bg-blue-200 transition-all"
              >
                Inscribir
              </button>
            )}
          </div>
        </form>
        <div className="min-h-[56px]">
          {(verificacionError || error) && (
            <div className="p-4 text-base text-center text-red-700 bg-red-100 border border-red-300 rounded-md">
              {verificacionError || error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
