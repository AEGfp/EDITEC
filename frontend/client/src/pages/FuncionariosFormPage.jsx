import { useForm } from "react-hook-form";
import {
  crearUsuario,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "../api/usuarios.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";
import MostrarError from "../components/MostrarError";

export default function FuncionarioFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  const [editable, setEditable] = useState(false);
  const [backendError, setBackendError] = useState(null);
  const navigate = useNavigate();
  const pagina = "/funcionarios";
  const params = useParams();

  useEffect(() => {
    async function cargarUsuario() {
      if (params.id) {
        const { data } = await obtenerUsuario(params.id);
        setValue("username", data.username);
        setValue("email", data.email);
        setValue("groups", data.groups);

        setValue("persona.nombre", data.persona.nombre);
        setValue("persona.apellido", data.persona.apellido);
        setValue("persona.segundo_apellido", data.persona.segundo_apellido);
        setValue("persona.fecha_nacimiento", data.persona.fecha_nacimiento);
        setValue("persona.sexo", data.persona.sexo);
        setValue("persona.ci", data.persona.ci);
        setValue("persona.domicilio", data.persona.domicilio);
      } else {
        reset();
        setEditable(true);
      }
    }
    cargarUsuario();
  }, [params.id]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setBackendError(null);
      if (params.id) {
        const { persona, password, ...datos } = data;
        const personaPatch = { ...persona };
        delete personaPatch.ci;

        const datosCompletos = { ...datos, persona: personaPatch };
        await actualizarUsuario(params.id, datosCompletos);
      } else {
        await crearUsuario(data);
      }
      navigate(pagina);
    } catch (error) {
      console.error(
        "Error al guardar usuario:",
        error.response?.data || error.message
      );
      setBackendError(error.response?.data || { detail: "Error desconocido" });
    }
  });

  const habilitarEdicion = () => setEditable(true);

  const descartarUsuario = async () => {
    const confirmar = window.confirm("¿Estás seguro de eliminar este usuario?");
    if (confirmar) {
      await eliminarUsuario(params.id);
      navigate(pagina);
    }
  };

  const puedeEscribir = tienePermiso("funcionarios", "escritura");

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">Funcionario</h1>
        <form onSubmit={onSubmit} id="editar-funcionario">
          <div className="flex flex-col md:flex-row justify-center items-start gap-8">
            <div className="max-w-lg w-full">
              <fieldset disabled={!editable}>
                <h4 className="formulario-elemento">Usuario</h4>
                <input
                  type="text"
                  placeholder="Nombre de usuario"
                  className="formulario-input"
                  {...register("username", {
                    required: "El nombre de usuario es obligatorio",
                    minLength: {
                      value: 4,
                      message: "El usuario debe tener al menos 4 caracteres",
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message:
                        "Solo letras, números y guiones bajos son permitidos",
                    },
                  })}
                />
                {errors.username && (
                  <MostrarError errores={errors.username.message} />
                )}

                <h4 className="formulario-elemento">Correo</h4>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  className="formulario-input"
                  {...register("email", {
                    required: "El correo es obligatorio",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Formato de correo inválido",
                    },
                  })}
                />
                {errors.email && (
                  <MostrarError errores={errors.email.message} />
                )}
                {/*
                //! Cambiar requisitos de contraseña
                */}
                {!params.id && (
                  <>
                    <h4 className="formulario-elemento">Contraseña</h4>
                    <input
                      type="password"
                      placeholder="Contraseña"
                      className="formulario-input"
                      {...register("password", {
                        required: "La contraseña es obligatoria",
                        minLength: {
                          value: 6,
                          message:
                            "La contraseña debe tener al menos 6 caracteres",
                        },
                      })}
                    />
                    {errors.password && (
                      <MostrarError errores={errors.password.message} />
                    )}
                  </>
                )}

                <h4 className="formulario-elemento">Roles</h4>
                <div className="formulario-lista">
                  <label>
                    <input
                      type="checkbox"
                      value="profesor"
                      {...register("groups", {
                        validate: (value) =>
                          (value && value.length > 0) ||
                          "Debe seleccionar al menos un rol",
                      })}
                      disabled={!editable}
                    />
                    Profesor
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      value="administrador"
                      {...register("groups")}
                      disabled={!editable}
                    />
                    Administrador
                  </label>
                  {/*<label>
                    <input
                      type="checkbox"
                      value="director"
                      {...register("groups")}
                      disabled={!editable}
                    />
                    Director
                  </label>*/}
                </div>
                {errors.groups && (
                  <span className="mensaje-error">{errors.groups.message}</span>
                )}
              </fieldset>
            </div>

            <div className="max-w-lg w-full">
              <fieldset disabled={!editable}>
                <h4 className="formulario-elemento">Nombre</h4>
                <input
                  type="text"
                  className="formulario-input"
                  {...register("persona.nombre", { required: true })}
                />
                {errors.persona?.nombre && <CampoRequerido />}

                <h4 className="formulario-elemento">Apellido</h4>
                <input
                  type="text"
                  className="formulario-input"
                  {...register("persona.apellido", { required: true })}
                />
                {errors.persona?.apellido && <CampoRequerido />}

                <h4 className="formulario-elemento">Segundo Apellido</h4>
                <input
                  type="text"
                  className="formulario-input"
                  {...register("persona.segundo_apellido")}
                />

                <h4 className="formulario-elemento">Fecha de Nacimiento</h4>
                <input
                  type="date"
                  className="formulario-input"
                  {...register("persona.fecha_nacimiento", {
                    required: "La fecha de nacimiento es obligatoria",
                    validate: (value) => {
                      if (!value)
                        return "La fecha de nacimiento es obligatoria";

                      const hoy = new Date();
                      const fechaNacimiento = new Date(value);
                      const edadDifMs = hoy - fechaNacimiento;
                      const edadDate = new Date(edadDifMs);
                      const edad = Math.abs(edadDate.getUTCFullYear() - 1970);

                      return (
                        edad >= 18 || "La persona debe ser mayor de 18 años"
                      );
                    },
                  })}
                />
                {errors.persona?.fecha_nacimiento && (
                  <MostrarError
                    errores={errors.persona?.fecha_nacimiento.message}
                  />
                )}

                <h4 className="formulario-elemento">Sexo</h4>
                <select
                  className="formulario-input"
                  {...register("persona.sexo", { required: true })}
                >
                  <option value="">Seleccione...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
                {errors.persona?.sexo && <CampoRequerido />}

                <h4 className="formulario-elemento">CI</h4>
                <input
                  type="text"
                  className="formulario-input"
                  {...register("persona.ci", {
                    required: !params.id ? "El CI es obligatorio" : false,
                    pattern: {
                      value: /^[0-9]+[A-D]?$/,
                      message:
                        "El CI debe contener solo números y opcionalmente una letra mayúscula entre A y D al final",
                    },
                    minLength: {
                      value: 5,
                      message: "El CI debe tener al menos 5 dígitos",
                    },
                  })}
                />
                {errors.persona?.ci && (
                  <MostrarError errores={errors.persona?.ci.message} />
                )}

                <h4 className="formulario-elemento">Domicilio</h4>
                <input
                  type="text"
                  className="formulario-input"
                  {...register("persona.domicilio")}
                />
              </fieldset>
            </div>
          </div>
        </form>
        <br />
        <div className="botones-grupo">
          {puedeEscribir && !editable && (
            <button onClick={habilitarEdicion} className="boton-editar">
              Editar
            </button>
          )}
          {puedeEscribir && editable && (
            <button
              type="submit"
              form="editar-funcionario"
              className="boton-guardar"
            >
              Guardar
            </button>
          )}
          <br />
          {params.id && puedeEscribir && editable && (
            <button onClick={descartarUsuario} className="boton-eliminar">
              Eliminar
            </button>
          )}
        </div>
        <MostrarError errores={backendError} />
      </div>
    </div>
  );
}
