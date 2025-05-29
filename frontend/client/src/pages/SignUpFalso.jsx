import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpApi } from "../api/signup.api";

export default function SignUpFalso() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [groups, setGroups] = useState([]);
  const [persona, setpersona] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const signUp = async (event) => {
    event.preventDefault();
    console.log({
      username,
      password,
      groups,
      persona,
    });
    try {
      const response = await signUpApi({
        username,
        password,
        groups,
        persona,
      });
      if (response.status === 201) {
        console.log(response);
        navigate("/login");
      }
    } catch (err) {
      setError("Ocurrió un error o el nombre de usuario ya existe");
      console.error("Error:", err);
    }
  };

  const handleGroups = (e) => {
    const { name, checked } = e.target;

    if (checked) {
      setGroups([...groups, name]);
    } else {
      setGroups(groups.filter((group) => group !== name));
    }
  };

  const handlePersona = (e) => {
    const { name, value } = e.target;
    setpersona((personaAnterior) => ({ ...personaAnterior, [name]: value }));
  };

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        <h2 className="formulario-titulo">Sign Up</h2>
        <form onSubmit={signUp}>
          <div className="formulario-elemento">
            <h3>User: </h3>
          </div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="formulario-input"
          />
          <div className="formulario-elemento">
            <h3>Password: </h3>
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
            className="formulario-input"
            required
          />

          <div className="formulario-elemento">
            <h3>Sexo: </h3>
            <div className="formulario-lista">
              <label>
                <input
                  type="radio"
                  name="sexo"
                  value="M"
                  checked={persona.sexo === "M"}
                  onChange={handlePersona}
                  required
                />
                <span className="ml-1">Masculino</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="sexo"
                  value="F"
                  checked={persona.sexo === "F"}
                  onChange={handlePersona}
                  required
                />
                <span className="ml-1">Femenino</span>
              </label>
            </div>
          </div>

          <div className="formulario-elemento">
            <h3>Roles: </h3>
          </div>

          <div className="formulario-lista">
            <label>
              <input
                type="checkbox"
                name="director"
                id="1"
                onChange={handleGroups}
              />
              <span className="ml-1">Director</span>
            </label>
            <label>
              <input
                type="checkbox"
                name="profesor"
                id="2"
                onChange={handleGroups}
              />
              <span className="ml-1">Profesor</span>
            </label>
            <label>
              <input
                type="checkbox"
                name="administrador"
                id="3"
                onChange={handleGroups}
              />
              <span className="ml-1">Administrador</span>
            </label>
            <label>
              <input
                type="checkbox"
                name="tutor"
                id="4"
                onChange={handleGroups}
              />
              <span className="ml-1">Tutor</span>
            </label>
          </div>
          <button type="submit" className="boton-guardar mx-auto block">
            Sign in
          </button>
        </form>
        {error && <p className="text-red-600 font-bold text-sm">{error}</p>}
      </div>
    </div>
  );
}
