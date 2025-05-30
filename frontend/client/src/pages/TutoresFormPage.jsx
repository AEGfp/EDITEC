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

function TutoresFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm();

  const [editable, setEditable] = useState(false);
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
          email: data.email, // ✅ Agregado
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
        email: data.email, // ✅ Agregado
      });

      navigate(pagina);
    } catch (error) {
      console.error("❌ Error al guardar el tutor:", error);
    }
  };

  const habilitarEdicion = () => setEditable(true);

  const descartarTutor = async () => {
    const confirmar = window.confirm("¿Estás seguro que quieres eliminar este tutor?");
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
              {...register("ci", { required: true })}
            />
            {errors.ci && <CampoRequerido />}

            <h4 className="formulario-elemento">Fecha de nacimiento</h4>
            <input
              type="date"
              className="formulario-input"
              {...register("fecha_nacimiento", { required: true })}
            />
            {errors.fecha_nacimiento && <CampoRequerido />}

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
            <input className="formulario-input" {...register("telefono_casa")} />

            <h4 className="formulario-elemento">Email</h4>
            <input
              className="formulario-input"
              type="email"
              {...register("email", { required: true })}
            />
            {errors.email && <CampoRequerido />}

            <h4 className="formulario-elemento">Teléfono particular</h4>
            <input className="formulario-input" {...register("telefono_particular")} />

            <h4 className="formulario-elemento">Teléfono trabajo</h4>
            <input className="formulario-input" {...register("telefono_trabajo")} />

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
            <textarea className="formulario-input" {...register("observaciones")} />
          </fieldset>
        </form>

        <div className="botones-grupo">
          {puedeEscribir && !editable && (
            <button onClick={habilitarEdicion} className="boton-editar">
              Editar
            </button>
          )}
          {puedeEscribir && editable && (
            <button type="submit" form="editar-tutor" className="boton-guardar">
              Guardar
            </button>
          )}
          <br />
          {params.id && puedeEscribir && editable && (
            <button onClick={descartarTutor} className="boton-eliminar">
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TutoresFormPage;
