import { useForm } from "react-hook-form";
import {
  crearTutor,
  actualizarTutor,
  eliminarTutor,
  obtenerTutor,
} from "../api/tutores.api";
import { crearPersona, actualizarPersona } from "../api/personas.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";
import MostrarError from "../components/MostrarError";

function TutoresFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    defaultValues: {
      es_propio: false,
    },
  });
  const [editable, setEditable] = useState(false);
  const [errorBackend, setErrorBackend] = useState(null);
  const navigate = useNavigate();
  const params = useParams();
  const pagina = "/tutores";
  const puedeEscribir = tienePermiso("tutores", "escritura");

  useEffect(() => {
    async function cargarTutor() {
      try {
        if (params.id) {
          const { data } = await obtenerTutor(params.id);
          const persona = data.id_persona || {};
          const personaId = typeof persona === "object" ? persona.id : persona;

          setValue("id_persona", personaId);
          setValue("nombre", persona.nombre || "");
          setValue("apellido", persona.apellido || "");
          setValue("ci", persona.ci || "");
          setValue("fecha_nacimiento", persona.fecha_nacimiento || "");
          setValue("sexo", persona.sexo || "");
          setValue("email", data.email || "");

          setValue("es_docente", data.es_docente);
          setValue("es_estudiante", data.es_estudiante);
          setValue("es_funcionario", data.es_funcionario);
          setValue("telefono_casa", data.telefono_casa);
          setValue("telefono_particular", data.telefono_particular);
          setValue("telefono_trabajo", data.telefono_trabajo);
          setValue("nombre_empresa_trabajo", data.nombre_empresa_trabajo);
          setValue("direccion_trabajo", data.direccion_trabajo);
          setValue("observaciones", data.observaciones);
          setValue("es_propio", data.es_propio);
          setEditable(false);
        } else {
          reset({
            es_docente: false,
            es_estudiante: false,
            es_funcionario: false,
          });
          setEditable(true);
        }
      } catch (error) {
        console.error("❌ Error al cargar el tutor:", error);
      }
    }

    cargarTutor();
  }, [params.id, reset, setValue]);

  const onSubmit = async (data) => {
    setErrorBackend(null);
    try {
      const idPersona = data.id_persona || watch("id_persona");

      if (params.id) {
        await actualizarPersona(idPersona, {
          nombre: data.nombre,
          apellido: data.apellido,
          ci: data.ci,
          fecha_nacimiento: data.fecha_nacimiento,
          sexo: data.sexo,
        });

        await actualizarTutor(params.id, {
          id_persona: idPersona,
          es_docente: data.es_docente,
          es_estudiante: data.es_estudiante,
          es_funcionario: data.es_funcionario,
          telefono_casa: data.telefono_casa,
          telefono_particular: data.telefono_particular,
          telefono_trabajo: data.telefono_trabajo,
          nombre_empresa_trabajo: data.nombre_empresa_trabajo,
          direccion_trabajo: data.direccion_trabajo,
          observaciones: data.observaciones,
          email: data.email,
        });

        navigate(pagina);
        return;
      }

      const resPersona = await crearPersona({
        nombre: data.nombre,
        apellido: data.apellido,
        ci: data.ci,
        fecha_nacimiento: data.fecha_nacimiento,
        sexo: data.sexo,
      });

      if (!resPersona.data.id) {
        throw new Error("❌ La respuesta no contiene un ID");
      }

      await crearTutor({
        id_persona: resPersona.data.id,
        es_docente: data.es_docente,
        es_estudiante: data.es_estudiante,
        es_funcionario: data.es_funcionario,
        telefono_casa: data.telefono_casa,
        telefono_particular: data.telefono_particular,
        telefono_trabajo: data.telefono_trabajo,
        nombre_empresa_trabajo: data.nombre_empresa_trabajo,
        direccion_trabajo: data.direccion_trabajo,
        observaciones: data.observaciones,
        email: data.email,
      });

      navigate(pagina);
    } catch (error) {
      console.error("❌ Error al guardar el tutor:", error);
      setErrorBackend(error.response?.data || "Error desconocido");
    }
  };

  const habilitarEdicion = () => setEditable(true);

  const descartarTutor = async () => {
    const confirmar = window.confirm(
      "¿Estás seguro que quieres eliminar este tutor?"
    );
    if (confirmar) {
      await eliminarTutor(params.id);
      navigate(pagina);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex justify-center items-center py-10">
      <div className="bg-white rounded-xl shadow-md w-full max-w-3xl p-6">
        <div className="bg-blue-100 rounded-md px-4 py-2 mb-6 text-center">
          <h2 className="text-lg font-bold text-blue-700 flex items-center justify-center gap-2">
            👨‍🏫 {params.id ? "Tutor" : "Nuevo Tutor"}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} id="editar-tutor" className="space-y-4">
          <input type="hidden" {...register("id_persona")} />

          <fieldset disabled={!editable} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register("es_docente")} className="w-5 h-5" />
                <span className="font-medium">Es docente</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register("es_estudiante")} className="w-5 h-5" />
                <span className="font-medium">Es estudiante</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register("es_funcionario")} className="w-5 h-5" />
                <span className="font-medium">Es funcionario</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Nombre</label>
                <input
                  className="formulario-input"
                  {...register("nombre", { required: true })}
                />
                {errors.nombre && <CampoRequerido />}
              </div>

              <div>
                <label className="block mb-1 font-medium">Apellido</label>
                <input
                  className="formulario-input"
                  {...register("apellido", { required: true })}
                />
                {errors.apellido && <CampoRequerido />}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 font-medium">Cédula de Identidad</label>
                <input
                  className="formulario-input"
                  {...register("ci", {
                    required: "El CI es obligatorio",
                    pattern: {
                      value: /^\d{5,}[A-D]?$/,
                      message: "Debe tener al menos 5 números y puede terminar con A, B, C o D",
                    },
                  })}
                />
                {errors.ci && <CampoRequerido mensaje={errors.ci.message} />}
              </div>

              <div>
                <label className="block mb-1 font-medium">Fecha de nacimiento</label>
                <input
                  type="date"
                  className="formulario-input"
                  {...register("fecha_nacimiento", {
                    required: "La fecha de nacimiento es obligatoria",
                    validate: (value) => {
                      if (!value) return "La fecha de nacimiento es obligatoria";
                      const fecha = new Date(value);
                      const hoy = new Date();
                      if (fecha > hoy) return "La fecha no puede ser futura";
                      const edad = hoy.getFullYear() - fecha.getFullYear();
                      return edad >= 18 ? true : "El tutor debe ser mayor de edad";
                    },
                  })}
                />
                {errors.fecha_nacimiento && (
                  <MostrarError errores={errors.fecha_nacimiento.message} />
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Sexo</label>
                <select
                  className="formulario-input"
                  {...register("sexo", { required: true })}
                >
                  <option value="">Seleccione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
                {errors.sexo && <CampoRequerido />}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 font-medium">Teléfono casa</label>
                <input
                  className="formulario-input"
                  {...register("telefono_casa", {
                    required: "El teléfono de casa es obligatorio",
                    pattern: {
                      value: /^[\d\s]{6,20}$/,
                      message: "Debe tener entre 6 y 15 dígitos numéricos",
                    },
                  })}
                />
                {errors.telefono_casa && (
                  <CampoRequerido mensaje={errors.telefono_casa.message} />
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Teléfono particular</label>
                <input
                  className="formulario-input"
                  {...register("telefono_particular", {
                    required: "El teléfono particular es obligatorio",
                    pattern: {
                      value: /^[\d\s]{6,20}$/,
                      message: "Debe tener entre 6 y 15 dígitos numéricos",
                    },
                  })}
                />
                {errors.telefono_particular && (
                  <CampoRequerido mensaje={errors.telefono_particular.message} />
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Teléfono trabajo</label>
                <input
                  className="formulario-input"
                  {...register("telefono_trabajo", {
                    required: "El teléfono de trabajo es obligatorio",
                    pattern: {
                      value: /^[\d\s]{6,20}$/,
                      message: "Debe tener entre 6 y 15 dígitos numéricos",
                    },
                  })}
                />
                {errors.telefono_trabajo && (
                  <CampoRequerido mensaje={errors.telefono_trabajo.message} />
                )}
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                className="formulario-input"
                type="email"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Nombre empresa trabajo</label>
                <input
                  className="formulario-input"
                  {...register("nombre_empresa_trabajo")}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Dirección trabajo</label>
                <input
                  className="formulario-input"
                  {...register("direccion_trabajo")}
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium">Observaciones</label>
              <textarea
                className="formulario-input min-h-[100px]"
                {...register("observaciones")}
              />
            </div>
          </fieldset>

          <div className="flex justify-center gap-3 mt-6">
            {watch("es_propio") && !editable && (
              <button 
                onClick={habilitarEdicion} 
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                ✏️ Editar
              </button>
            )}
            {watch("es_propio") && editable && (
              <button
                type="submit"
                form="editar-tutor"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                💾 Guardar
              </button>
            )}
            {params.id && watch("es_propio") && editable && (
              <button 
                onClick={descartarTutor} 
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                🗑️ Eliminar
              </button>
            )}
          </div>
        </form>

        {errorBackend && (
          <div className="mt-4">
            <MostrarError errores={errorBackend} />
          </div>
        )}
      </div>
    </div>
  );
}

export default TutoresFormPage;