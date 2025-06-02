import { useForm } from "react-hook-form";
import { obtenerTutor } from "../api/tutores.api";
import { useEffect } from "react";

function ConsultarTutores({ idTutor }) {
  const { register, setValue } = useForm();

  useEffect(() => {
    async function cargarTutor() {
      try {
        if (idTutor) {
          const { data } = await obtenerTutor(idTutor);
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
        }
      } catch (error) {
        console.error("❌ Error al cargar el tutor:", error);
      }
    }

    cargarTutor();
  }, [idTutor, setValue]);

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">Tutor</h1>
        <form>
          <input type="hidden" {...register("id_persona")} />
          <fieldset disabled>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <h4 className="formulario-elemento">Nombre</h4>
                <input className="formulario-input" {...register("nombre")} />

                <h4 className="formulario-elemento">Apellido</h4>
                <input className="formulario-input" {...register("apellido")} />

                <h4 className="formulario-elemento">CI</h4>
                <input className="formulario-input" {...register("ci")} />

                <h4 className="formulario-elemento">Fecha de nacimiento</h4>
                <input
                  type="date"
                  className="formulario-input"
                  {...register("fecha_nacimiento")}
                />

                <h4 className="formulario-elemento">Sexo</h4>
                <select className="formulario-input" {...register("sexo")}>
                  <option value="">Seleccione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>

                <h4 className="formulario-elemento">Teléfono casa</h4>
                <input
                  className="formulario-input"
                  {...register("telefono_casa")}
                />

                <h4 className="formulario-elemento">Email</h4>
                <input
                  className="formulario-input"
                  type="email"
                  {...register("email")}
                />
              </div>
              <div className="flex-1">
                <h4 className="formulario-elemento">Teléfono particular</h4>
                <input
                  className="formulario-input"
                  {...register("telefono_particular")}
                />

                <h4 className="formulario-elemento">Teléfono trabajo</h4>
                <input
                  className="formulario-input"
                  {...register("telefono_trabajo")}
                />

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
                <div className="formulario-elemento">
                  <h3>Relación:</h3>
                </div>

                <div className="formulario-lista">
                  <label>
                    <input
                      type="checkbox"
                      {...register("es_docente")}
                      disabled
                    />
                    <span className="ml-1">Es docente</span>
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      {...register("es_estudiante")}
                      disabled
                    />
                    <span className="ml-1">Es estudiante</span>
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      {...register("es_funcionario")}
                      disabled
                    />
                    <span className="ml-1">Es funcionario</span>
                  </label>
                </div>

                <h4 className="formulario-elemento">Observaciones</h4>
                <textarea
                  className="formulario-input"
                  {...register("observaciones")}
                />
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}

export default ConsultarTutores;
