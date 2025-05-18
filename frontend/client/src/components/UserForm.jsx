import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpApi } from "../api/signup.api";
import { loginApi } from "../api/login.api";
import { loginUsuario } from "../utils/loginUsuario";

export default function UserForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [persona, setpersona] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const groups = ["tutor"];
  const signUp = async (event) => {
    event.preventDefault();
    /*console.log({
      username,
      password,
      groups,
      persona,
    });*/
    try {
      const response = await signUpApi({
        username,
        password,
        groups,
        persona,
      });
      if (response.status === 201) {
        console.log(response);
        await loginUsuario({
          username,
          password,
          navigate,
          setError,
          setLoading,
        });
        navigate("/tutores-crear");
      }
    } catch (err) {
      setError(
        "Ocurrió un error al completar el formulario o el nombre de usuario ya existe"
      );
      console.error("Error:", err);
    }
  };

  const handlePersona = (e) => {
    const { name, value } = e.target;
    setpersona((personaAnterior) => ({ ...personaAnterior, [name]: value }));
  };

  const ingresarConUsuario = async (event) => {
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
        navigate("/home");
      }
    } catch (err) {
      setError("Contraseña o usuario inválidos");
      console.error("Error de login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        <h2 className="formulario-titulo">Sign Up</h2>
        <form onSubmit={signUp}>
          <div className="formulario-elemento">
            <h3>Nombre de Usuario: </h3>
          </div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="formulario-input"
          />

          <div className="formulario-elemento">
            <h3>Constraseña: </h3>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="formulario-input"
          />

          <div className="formulario-elemento">
            <h3>Nombre: </h3>
          </div>
          <input
            type="text"
            name="nombre"
            value={persona.nombre || ""}
            onChange={handlePersona}
            placeholder="Nombre"
            className="formulario-input"
          />

          <div className="formulario-elemento">
            <h3>Apellido: </h3>
          </div>
          <input
            type="text"
            name="apellido"
            value={persona.apellido || ""}
            onChange={handlePersona}
            placeholder="Apellido"
            className="formulario-input"
          />

          <div className="formulario-elemento">
            <h3>Segundo apellido: </h3>
          </div>
          <input
            type="text"
            name="segundo_apellido"
            value={persona.segundo_apellido || ""}
            onChange={handlePersona}
            placeholder="Segundo apellido"
            className="formulario-input"
          />

          <div className="formulario-elemento">
            <h3>CI: </h3>
          </div>
          <input
            type="number"
            name="ci"
            value={persona.ci || ""}
            onChange={handlePersona}
            placeholder="CI"
            className="formulario-input"
          />

          <div className="formulario-elemento">
            <h3>Fecha de nacimiento: </h3>
          </div>
          <input
            type="date"
            name="fecha_nacimiento"
            value={persona.fecha_nacimiento || ""}
            onChange={handlePersona}
            placeholder="01/01/1960"
            className="formulario-input"
          />

          <div className="formulario-elemento">
            <fieldset className="formulario-lista">
              <legend>
                <h3>Sexo: </h3>
              </legend>
              <div>
                <input
                  type="radio"
                  id="masculino"
                  name="sexo"
                  value="M"
                  onChange={handlePersona}
                />
                <label htmlFor="masculino">Masculino</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="femenino"
                  name="sexo"
                  value="F"
                  onChange={handlePersona}
                />
                <label htmlFor="femenino">Femenino</label>
              </div>
            </fieldset>
          </div>
          <div className="formulario-elemento">
            <h3>Domicilio: </h3>
          </div>
          <input
            type="text"
            name="domicilio"
            value={persona.domicilio || ""}
            onChange={handlePersona}
            placeholder="Calle c/ calle, nro de calle, ciudad"
            className="formulario-input"
          />
          <button type="submit" className="mt-4 boton-guardar mx-auto block">
            Sign in
          </button>
        </form>
        {error && <p className="text-red-600 font-bold text-sm">{error}</p>}
      </div>
    </div>
  );
}
