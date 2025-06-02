import { useForm } from "react-hook-form";
import { obtenerInfante } from "../api/infantes.api";
import { useEffect } from "react";

function ConsultarInfantes({ idInfante }) {
  const { register, setValue } = useForm();

  useEffect(() => {
    async function cargarInfante() {
      try {
        if (idInfante) {
          const { data } = await obtenerInfante(idInfante);
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
      } catch (error) {
        console.error("Error al cargar el infante", error);
      }
    }

    cargarInfante();
  }, [idInfante, setValue]);

  if (!idInfante) {
    return <p>No se especificó el ID del infante para mostrar.</p>;
  }

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">Datos del Infante</h1>
        <form>
          <input type="hidden" {...register("id_persona")} />

          <fieldset disabled>
            <h4 className="formulario-elemento">Nombre</h4>
            <input
              className="formulario-input"
              {...register("nombre")}
              type="text"
            />

            <h4 className="formulario-elemento">Apellido</h4>
            <input
              className="formulario-input"
              {...register("apellido")}
              type="text"
            />

            <h4 className="formulario-elemento">C.I.</h4>
            <input
              className="formulario-input"
              {...register("ci")}
              type="text"
            />

            <h4 className="formulario-elemento">¿Alergia?</h4>
            <input
              className="formulario-input"
              type="text"
              {...register("ind_alergia")}
              readOnly
            />

            <h4 className="formulario-elemento">¿Intolerancia a la lactosa?</h4>
            <input
              className="formulario-input"
              type="text"
              {...register("ind_intolerancia_lactosa")}
              readOnly
            />

            <h4 className="formulario-elemento">¿Celiaquismo?</h4>
            <input
              className="formulario-input"
              type="text"
              {...register("ind_celiaquismo")}
              readOnly
            />

            <h4 className="formulario-elemento">Permiso para cambiar pañal</h4>
            <input
              className="formulario-input"
              type="text"
              {...register("permiso_cambio_panhal")}
              readOnly
            />

            <h4 className="formulario-elemento">Permiso para fotos</h4>
            <input
              className="formulario-input"
              type="text"
              {...register("permiso_fotos")}
              readOnly
            />
          </fieldset>
        </form>
      </div>
    </div>
  );
}

export default ConsultarInfantes;
