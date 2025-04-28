import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpApi } from "../api/signup.api";

export default function SignUpPage() {
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
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={signUp}>
        <div>
          <h3>User: </h3>
        </div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <div>
          <h3>Password: </h3>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <div>
          <h3>Nombre: </h3>
        </div>

        <input
          type="text"
          name="nombre"
          value={persona.nombre || ""}
          onChange={handlePersona}
          placeholder="Nombre"
        />
        <div>
          <h3>Apellido: </h3>
        </div>

        <input
          type="text"
          name="apellido"
          value={persona.apellido || ""}
          onChange={handlePersona}
          placeholder="Apellido"
        />
        <div>
          <h3>CI: </h3>
        </div>

        <input
          type="number"
          name="ci"
          value={persona.ci || ""}
          onChange={handlePersona}
          placeholder="CI"
        />

        <div>
          <h3>Roles: </h3>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              name="director"
              id="1"
              onChange={handleGroups}
            />
            Director
          </label>
          <label>
            <input
              type="checkbox"
              name="profesor"
              id="2"
              onChange={handleGroups}
            />
            Profesor
          </label>
          <label>
            <input
              type="checkbox"
              name="administrador"
              id="3"
              onChange={handleGroups}
            />
            Administrador
          </label>
          <label>
            <input
              type="checkbox"
              name="tutor"
              id="4"
              onChange={handleGroups}
            />
            Tutor
          </label>
        </div>
        <button type="submit">Sign in</button>
      </form>
      {error && <p className="text-red-600 font-bold text-sm">{error}</p>}
    </div>
  );
}
