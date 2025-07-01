import { useForm } from "react-hook-form";
import { obtenerTutor } from "../api/tutores.api";
import { useEffect, useState } from "react";

function ConsultarTutores({ idTutor }) {
  const { register, setValue } = useForm();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarTutor() {
      try {
        setCargando(true);
        if (idTutor) {
          const { data } = await obtenerTutor(
            idTutor,
            "?incluir_inactivos=true"
          );
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
        setCargando(false);
      } catch (error) {
        console.error("Error al cargar el tutor:", error);
        setError("Error al cargar los datos del tutor.");
        setCargando(false);
      }
    }

    cargarTutor();
  }, [idTutor, setValue]);

  if (cargando) return <p className="p-4">Cargando datos del tutor...</p>;
  if (error) return <p className="text-red-500 p-4">{error}</p>;
  if (!idTutor) return <p className="p-4">No se especificó el ID del tutor para mostrar.</p>;

  return (
    <div className="min-h-screen bg-blue-50 flex justify-center items-center py-10">
      <div className="bg-white rounded-xl shadow-md w-full max-w-4xl p-6">
        <div className="bg-blue-100 rounded-md px-4 py-2 mb-6 text-center">
          <h2 className="text-lg font-bold text-blue-700 flex items-center justify-center gap-2">
            👨‍🏫 Información del Tutor
          </h2>
        </div>

        <form>
          <input type="hidden" {...register("id_persona")} />
          <fieldset disabled className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda */}
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Nombre</label>
                  <input 
                    className="formulario-input w-full" 
                    {...register("nombre")} 
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Apellido</label>
                  <input 
                    className="formulario-input w-full" 
                    {...register("apellido")} 
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Cédula de Identidad</label>
                  <input 
                    className="formulario-input w-full" 
                    {...register("ci")} 
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Fecha de nacimiento</label>
                  <input
                    type="date"
                    className="formulario-input w-full"
                    {...register("fecha_nacimiento")}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Sexo</label>
                  <select 
                    className="formulario-input w-full" 
                    {...register("sexo")}
                  >
                    <option value="">Seleccione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Teléfono casa</label>
                  <input
                    className="formulario-input w-full"
                    {...register("telefono_casa")}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Email</label>
                  <input
                    className="formulario-input w-full"
                    type="email"
                    {...register("email")}
                  />
                </div>
              </div>

              {/* Columna derecha */}
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Teléfono particular</label>
                  <input
                    className="formulario-input w-full"
                    {...register("telefono_particular")}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Teléfono trabajo</label>
                  <input
                    className="formulario-input w-full"
                    {...register("telefono_trabajo")}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Nombre empresa trabajo</label>
                  <input
                    className="formulario-input w-full"
                    {...register("nombre_empresa_trabajo")}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Dirección trabajo</label>
                  <input
                    className="formulario-input w-full"
                    {...register("direccion_trabajo")}
                  />
                </div>

                <div className="pt-2">
                  <h3 className="font-medium mb-2">Relación:</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        {...register("es_docente")}
                        disabled
                      />
                      Es docente
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        {...register("es_estudiante")}
                        disabled
                      />
                      Es estudiante
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        {...register("es_funcionario")}
                        disabled
                      />
                      Es funcionario
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Observaciones</label>
                  <textarea
                    className="formulario-input w-full min-h-[100px]"
                    {...register("observaciones")}
                  />
                </div>
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}

export default ConsultarTutores;