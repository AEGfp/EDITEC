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
    <div className="min-h-screen bg-blue-50 flex justify-center items-center py-10">
      <div className="bg-white rounded-xl shadow-md w-full max-w-4xl p-6">
        <div className="bg-blue-100 rounded-md px-4 py-2 mb-6 text-center">
          <h2 className="text-lg font-bold text-blue-700 flex items-center justify-center gap-2">
            👤 {params.id ? "Funcionario" : "Nuevo Funcionario"}
          </h2>
        </div>

        <form onSubmit={onSubmit} id="editar-funcionario" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <fieldset disabled={!editable} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Usuario</label>
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
                {errors.username && <MostrarError errores={errors.username.message} />}
              </div>

              <div>
                <label className="block mb-1 font-medium">Correo</label>
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
                {errors.email && <MostrarError errores={errors.email.message} />}
              </div>

              {!params.id && (
                <div>
                  <label className="block mb-1 font-medium">Contraseña</label>
                  <input
                    type="password"
                    placeholder="Contraseña"
                    className="formulario-input"
                    {...register("password", {
                      required: "La contraseña es obligatoria",
                      minLength: {
                        value: 6,
                        message: "La contraseña debe tener al menos 6 caracteres",
                      },
                    })}
                  />
                  {errors.password && <MostrarError errores={errors.password.message} />}
                </div>
              )}

              <div>
                <label className="block mb-1 font-medium">Roles</label>
                <div className="formulario-lista space-y-1">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      value="profesor"
                      {...register("groups", {
                        validate: (value) =>
                          (value && value.length > 0) || "Debe seleccionar al menos un rol",
                      })}
                      disabled={!editable}
                    />
                    Profesor
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      value="administrador"
                      {...register("groups")}
                      disabled={!editable}
                    />
                    Administrador
                  </label>
                </div>
                {errors.groups && <span className="text-sm text-red-600">{errors.groups.message}</span>}
              </div>
            </fieldset>

            <fieldset disabled={!editable} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Nombre</label>
                <input type="text" className="formulario-input" {...register("persona.nombre", { required: true })} />
                {errors.persona?.nombre && <CampoRequerido />}
              </div>

              <div>
                <label className="block mb-1 font-medium">Apellido</label>
                <input type="text" className="formulario-input" {...register("persona.apellido", { required: true })} />
                {errors.persona?.apellido && <CampoRequerido />}
              </div>

              <div>
                <label className="block mb-1 font-medium">Segundo Apellido</label>
                <input type="text" className="formulario-input" {...register("persona.segundo_apellido")} />
              </div>

              <div>
                <label className="block mb-1 font-medium">Fecha de Nacimiento</label>
                <input type="date" className="formulario-input" {...register("persona.fecha_nacimiento", {
                  required: "La fecha de nacimiento es obligatoria",
                  validate: (value) => {
                    if (!value) return "La fecha de nacimiento es obligatoria";
                    const hoy = new Date();
                    const fechaNacimiento = new Date(value);
                    const edadDifMs = hoy - fechaNacimiento;
                    const edadDate = new Date(edadDifMs);
                    const edad = Math.abs(edadDate.getUTCFullYear() - 1970);
                    return edad >= 18 || "La persona debe ser mayor de 18 años";
                  },
                })} />
                {errors.persona?.fecha_nacimiento && <MostrarError errores={errors.persona?.fecha_nacimiento.message} />}
              </div>

              <div>
                <label className="block mb-1 font-medium">Sexo</label>
                <select className="formulario-input" {...register("persona.sexo", { required: true })}>
                  <option value="">Seleccione...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
                {errors.persona?.sexo && <CampoRequerido />}
              </div>

              <div>
                <label className="block mb-1 font-medium">CI</label>
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
                {errors.persona?.ci && <MostrarError errores={errors.persona?.ci.message} />}
              </div>

              <div>
                <label className="block mb-1 font-medium">Domicilio</label>
                <input type="text" className="formulario-input" {...register("persona.domicilio")} />
              </div>
            </fieldset>
          </div>

          <div className="flex justify-center mt-6 gap-3">
            {puedeEscribir && !editable && (
              <button type="button" onClick={habilitarEdicion} className="boton-editar">
                ✏️ Editar
              </button>
            )}
            {puedeEscribir && editable && (
              <>
                <button type="submit" className="boton-guardar">
                  💾 Guardar
                </button>
                {params.id && (
                  <button type="button" onClick={descartarUsuario} className="boton-eliminar">
                    🗑️ Eliminar
                  </button>
                )}
              </>
            )}
          </div>

          <MostrarError errores={backendError} />
        </form>
      </div>
    </div>
  );
}
