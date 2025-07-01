import { useForm } from "react-hook-form";
import { obtenerInfante } from "../api/infantes.api";
import { useEffect, useState } from "react";
import MostrarError from "./MostrarError";

function ConsultarInfantes({ idInfante }) {
  const { register, setValue } = useForm();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function cargarInfante() {
      try {
        setCargando(true);
        if (idInfante) {
          const { data } = await obtenerInfante(
            idInfante,
            "?incluir_inactivos=true"
          );
          const persona = data.id_persona || {};
          const personaId = typeof persona === "object" ? persona.id : persona;

          setValue("id_persona", personaId);
          setValue("nombre", persona.nombre || "");
          setValue("apellido", persona.apellido || "");
          setValue("ci", persona.ci || "");

          setValue("ind_alergia", data.ind_alergia);
          setValue("ind_intolerancia_lactosa", data.ind_intolerancia_lactosa);
          setValue("ind_celiaquismo", data.ind_celiaquismo);
          setValue("permiso_cambio_panhal", data.permiso_cambio_panhal);
          setValue("permiso_fotos", data.permiso_fotos);
        }
        setCargando(false);
      } catch (error) {
        console.error("Error al cargar el infante", error);
        setError("Error al cargar los datos");
        setCargando(false);
      }
    }

    cargarInfante();
  }, [idInfante, setValue]);

  if (cargando) return <p className="p-4">Cargando datos...</p>;
  if (error) return <p className="text-red-500 p-4">{error}</p>;
  if (!idInfante) return <p className="p-4">No se especificó el ID del infante para mostrar.</p>;

  return (
    <div className="min-h-screen bg-blue-50 flex justify-center items-center py-10">
      <div className="bg-white rounded-xl shadow-md w-full max-w-xl p-6">
        <div className="bg-blue-100 rounded-md px-4 py-2 mb-6 text-center">
          <h2 className="text-lg font-bold text-blue-700 flex items-center justify-center gap-2">
            👶 Datos del Infante
          </h2>
        </div>

        <form>
          <input type="hidden" {...register("id_persona")} />
          
          <fieldset disabled className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Nombre</label>
              <input
                className="formulario-input w-full"
                {...register("nombre")}
                type="text"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Apellido</label>
              <input
                className="formulario-input w-full"
                {...register("apellido")}
                type="text"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Cédula de Identidad</label>
              <input
                className="formulario-input w-full"
                {...register("ci")}
                type="text"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">¿Alergia?</label>
                <input
                  className="formulario-input w-full"
                  type="text"
                  {...register("ind_alergia")}
                  readOnly
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">¿Intolerancia a la lactosa?</label>
                <input
                  className="formulario-input w-full"
                  type="text"
                  {...register("ind_intolerancia_lactosa")}
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">¿Celiaquismo?</label>
                <input
                  className="formulario-input w-full"
                  type="text"
                  {...register("ind_celiaquismo")}
                  readOnly
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Permiso para cambiar pañal</label>
                <input
                  className="formulario-input w-full"
                  type="text"
                  {...register("permiso_cambio_panhal")}
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium">Permiso para fotos</label>
              <input
                className="formulario-input w-full"
                type="text"
                {...register("permiso_fotos")}
                readOnly
              />
            </div>

            {error && <MostrarError mensajes={error} />}
          </fieldset>
        </form>
      </div>
    </div>
  );
}

export default ConsultarInfantes;