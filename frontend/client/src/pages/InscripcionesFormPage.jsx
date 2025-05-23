import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { crearInscripcion, obtenerInscripcion } from "../api/inscripciones.api";
import CampoRequerido from "../components/CampoRequerido";
import tienePermiso from "../utils/tienePermiso";

function InscripcionesFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const navigate = useNavigate();
  const params = useParams();
  const puedeEscribir = tienePermiso("inscripciones", "escritura");

  const [editable, setEditable] = useState(false);

  useEffect(() => {
    async function cargarInscripcion() {
      if (params.id) {
        const { data } = await obtenerInscripcion(params.id);
        setValue("id_infante", data.id_infante.id);
        setValue("id_tutor", data.id_tutor.id);
        setValue("estado", data.estado);
        setEditable(false);
      } else {
        setEditable(true);
      }
    }

    cargarInscripcion();
  }, [params.id, setValue]);

  const onSubmit = async (data) => {
    try {
      await crearInscripcion({
        id_infante: data.id_infante,
        id_tutor: data.id_tutor,
        estado: data.estado,
      });
      navigate("/inscripciones");
    } catch (error) {
      console.error("❌ Error al guardar la inscripción:", error.response?.data || error);
    }
  };

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">Inscripción</h1>
        <form onSubmit={handleSubmit(onSubmit)} id="form-inscripcion">
          <fieldset disabled={!editable}>
            <h4 className="formulario-elemento">ID Infante</h4>
            <input className="formulario-input" {...register("id_infante", { required: true })} />
            {errors.id_infante && <CampoRequerido />}

            <h4 className="formulario-elemento">ID Tutor</h4>
            <input className="formulario-input" {...register("id_tutor", { required: true })} />
            {errors.id_tutor && <CampoRequerido />}

            <h4 className="formulario-elemento">Estado</h4>
            <select className="formulario-input" {...register("estado", { required: true })}>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
            {errors.estado && <CampoRequerido />}
          </fieldset>
        </form>

        <div className="botones-grupo">
          {puedeEscribir && editable && (
            <button type="submit" form="form-inscripcion" className="boton-guardar">
              Guardar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default InscripcionesFormPage;
