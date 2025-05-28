import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpApi } from "../api/signup.api";
import { loginUsuario } from "../utils/loginUsuario";
import { useForm } from "react-hook-form";
import CampoRequerido from "./CampoRequerido";

export default function CamposUsuario({ register, errors }) {
  /*const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);
    const campos = {
      username: data.username,
      password: data.password,
      groups: ["tutor"],
      persona: {
        nombre: data.nombre,
        apellido: data.apellido,
        segundo_apellido: data.segundo_apellido,
        fecha_nacimiento: data.fecha_nacimiento,
        sexo: data.sexo,
        ci: data.ci,
        domicilio: data.domicilio,
      },
    };

    try {
      const res = await signUpApi(campos);
      if (res.status === 201) {
        console.log(res);
        await loginUsuario({
          username: data.username,
          password: data.password,
          setError,
          setLoading,
        });
        navigate("/tutores-crear");
      }
    } catch (err) {
      console.error("Error en el registro:", err);
      if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };
*/
  return (
    <>
      <h2 className="formulario-titulo">Sign Up</h2>

      <div className="formulario-elemento">
        <h3>Nombre de Usuario: </h3>
      </div>
      <input
        type="text"
        placeholder="Nombre de usuario"
        className="formulario-input"
        {...register("username", { required: true })}
      />
      {errors.username && <CampoRequerido />}
      <div className="formulario-elemento">
        <h3>Constraseña: </h3>
      </div>
      <input
        type="password"
        {...register("password", { required: true })}
        placeholder="Contraseña"
        className="formulario-input"
      />
      {errors.password && <CampoRequerido />}
      <div className="formulario-elemento">
        <h3>Nombre: </h3>
      </div>
      <input
        type="text"
        name="nombre"
        {...register("nombre", { required: true })}
        placeholder="Nombre"
        className="formulario-input"
      />
      {errors.nombre && <CampoRequerido />}
      <div className="formulario-elemento">
        <h3>Apellido: </h3>
      </div>
      <input
        type="text"
        name="apellido"
        {...register("apellido", { required: true })}
        placeholder="Apellido"
        className="formulario-input"
      />
      {errors.apellido && <CampoRequerido />}
      <div className="formulario-elemento">
        <h3>Segundo apellido: </h3>
      </div>
      <input
        type="text"
        name="segundo_apellido"
        {...register("segundo_apellido")}
        placeholder="Segundo apellido"
        className="formulario-input"
      />

      <div className="formulario-elemento">
        <h3>CI: </h3>
      </div>
      <input
        type="number"
        name="ci"
        {...register("ci", { required: true })}
        placeholder="CI"
        className="formulario-input"
      />
      {errors.ci && <CampoRequerido />}
      <div className="formulario-elemento">
        <h3>Fecha de nacimiento: </h3>
      </div>
      <input
        type="date"
        name="fecha_nacimiento"
        {...register("fecha_nacimiento", { required: true })}
        placeholder="01/01/1960"
        className="formulario-input"
      />
      {errors.fecha_nacimiento && <CampoRequerido />}
      <div className="formulario-elemento">
        <fieldset className="formulario-lista">
          <legend>
            <h3>Sexo: </h3>
          </legend>
          <div>
            <input
              type="radio"
              id="masculino"
              value="M"
              {...register("sexo", { required: true })}
            />
            <label htmlFor="masculino">Masculino</label>
          </div>
          <div>
            <input
              type="radio"
              id="femenino"
              value="F"
              {...register("sexo", { required: true })}
            />
            <label htmlFor="femenino">Femenino</label>
          </div>
        </fieldset>
      </div>
      {errors.sexo && <CampoRequerido />}
      <div className="formulario-elemento">
        <h3>Domicilio: </h3>
      </div>
      <input
        type="text"
        name="domicilio"
        {...register("domicilio")}
        placeholder="Calle c/ calle, nro de calle, ciudad"
        className="formulario-input"
      />
      {/*<button
        type="submit"
        className="mt-4 boton-guardar mx-auto block"
        disabled={loading}
      >
        {loading ? "Registrando..." : "Sign in"}
      </button>

      {errors && <p className="text-red-600 font-bold text-sm">{errors}</p>}*/}
    </>
  );
}
