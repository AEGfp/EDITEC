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
    <div className="formulario">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">Tutor</h1>
        <form onSubmit={handleSubmit(onSubmit)} id="editar-tutor">
          <input type="hidden" {...register("id_persona")} />

          <fieldset disabled={!editable}>
            <h4 className="formulario-elemento">Es docente</h4>
            <input type="checkbox" {...register("es_docente")} />

            <h4 className="formulario-elemento">Es estudiante</h4>
            <input type="checkbox" {...register("es_estudiante")} />

            <h4 className="formulario-elemento">Es funcionario</h4>
            <input type="checkbox" {...register("es_funcionario")} />

            <h4 className="formulario-elemento">Nombre</h4>
            <input
              className="formulario-input"
              {...register("nombre", { required: true })}
            />
            {errors.nombre && <CampoRequerido />}

            <h4 className="formulario-elemento">Apellido</h4>
            <input
              className="formulario-input"
              {...register("apellido", { required: true })}
            />
            {errors.apellido && <CampoRequerido />}

            <h4 className="formulario-elemento">CI</h4>
            <input
              className="formulario-input"
              {...register("ci", {
                required: "El CI es obligatorio",
                pattern: {
                  value: /^\d{5,}[A-D]?$/,
                  message:
                    "Debe tener al menos 5 números y puede terminar con una letra A, B, C o D",
                },
              })}
            />
            {errors.ci && <CampoRequerido mensaje={errors.ci.message} />}

            <h4 className="formulario-elemento">Fecha de nacimiento</h4>
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

            <h4 className="formulario-elemento">Sexo</h4>
            <select
              className="formulario-input"
              {...register("sexo", { required: true })}
            >
              <option value="">Seleccione</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
            {errors.sexo && <CampoRequerido />}

            <h4 className="formulario-elemento">Teléfono casa</h4>
            <input
              className="formulario-input"
              {...register("telefono_casa", {
                required: "El teléfono de casa es obligatorio",
                pattern: {
                  value: /^[\d\s]{6,20}$/,
                  message:
                    "El teléfono debe tener entre 6 y 15 dígitos numéricos",
                },
              })}
            />
            {errors.telefono_casa && (
              <CampoRequerido mensaje={errors.telefono_casa.message} />
            )}

            <h4 className="formulario-elemento">Email</h4>
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

            <h4 className="formulario-elemento">Teléfono particular</h4>
            <input
              className="formulario-input"
              {...register("telefono_particular", {
                required: "El teléfono particular es obligatorio",
                pattern: {
                  value: /^[\d\s]{6,20}$/,
                  message:
                    "El teléfono debe tener entre 6 y 15 dígitos numéricos",
                },
              })}
            />
            {errors.telefono_particular && (
              <CampoRequerido mensaje={errors.telefono_particular.message} />
            )}

            <h4 className="formulario-elemento">Teléfono trabajo</h4>
            <input
              className="formulario-input"
              {...register("telefono_trabajo", {
                required: "El teléfono de trabajo es obligatorio",
                pattern: {
                  value: /^[\d\s]{6,20}$/,
                  message:
                    "El teléfono debe tener entre 6 y 15 dígitos numéricos",
                },
              })}
            />
            {errors.telefono_trabajo && (
              <CampoRequerido mensaje={errors.telefono_trabajo.message} />
            )}

            <h4 className="formulario-elemento">Nombre empresa trabajo</h4>
            <input
              className="formulario-input"
              {...register("nombre_empresa_trabajo")}
            />

            <h4 className="formulario-elemento">Dirección trabajo</h4>
            <input
              className="formulario-input"
              {...register("direccion_trabajo")}
            />

            <h4 className="formulario-elemento">Observaciones</h4>
            <textarea
              className="formulario-input"
              {...register("observaciones")}
            />
          </fieldset>
        </form>

        <div className="botones-grupo">
          {watch("es_propio") && !editable && (
            <button onClick={habilitarEdicion} className="boton-editar">
              Editar
            </button>
          )}
          {watch("es_propio") && editable && (
            <button type="submit" form="editar-tutor" className="boton-guardar">
              Guardar
            </button>
          )}
          <br />
          {params.id && watch("es_propio") && editable && (
            <button onClick={descartarTutor} className="boton-eliminar">
              Eliminar
            </button>
          )}
        </div>

        {errorBackend && <MostrarError errores={errorBackend} />}
      </div>
    </div>
  );
}

export default TutoresFormPage;
