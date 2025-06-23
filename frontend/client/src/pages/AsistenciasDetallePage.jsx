import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  obtenerAsistencia,
  actualizarAsistencia,
} from "../api/asistencias.api";
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";
import MostrarError from "../components/MostrarError";

export default function AsistenciaDetallePage() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const { id } = useParams();
  const navigate = useNavigate();
  const [asistencia, setAsistencia] = useState(null);
  const puedeEditar = tienePermiso("asistencias", "escritura");
  const horaEntrada = watch("hora_entrada");

  useEffect(() => {
    async function cargarAsistencia() {
      try {
        const { data } = await obtenerAsistencia(id);
        setAsistencia(data);
        setValue("hora_entrada", data.hora_entrada?.slice(0, 5));
        setValue("hora_salida", data.hora_salida?.slice(0, 5));
      } catch (error) {
        console.error("Error al cargar asistencia:", error);
      }
    }
    cargarAsistencia();
  }, [id]);

  const onSubmit = handleSubmit(async (data) => {
    console.log(data.hora_salida);
    try {
      await actualizarAsistencia(id, {
        hora_entrada: data.hora_entrada,
        hora_salida: data.hora_salida,
      });
      navigate("/asistencias-historial");
    } catch (error) {
      console.error("Error al actualizar asistencia:", error);
    }
  });

  if (!asistencia) return <p className="p-4">Cargando asistencia...</p>;

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">Detalle de Asistencia</h1>
        <form onSubmit={onSubmit} id="form-asistencia">
          <fieldset disabled={!puedeEditar}>
            <h4 className="formulario-elemento">Nombre del infante</h4>
            <input
              className="formulario-input"
              value={`${asistencia.nombre_infante} ${asistencia.apellido_infante}`}
              disabled
              readOnly
            />

            <h4 className="formulario-elemento">Fecha</h4>
            <input
              className="formulario-input"
              value={asistencia.fecha_formateada}
              disabled
              readOnly
            />

            <h4 className="formulario-elemento">Estado</h4>
            <input
              className="formulario-input"
              value={asistencia.estado}
              disabled
              readOnly
            />

            <h4 className="formulario-elemento">Registrado por</h4>
            <input
              className="formulario-input"
              value={`${asistencia.nombre_usuario || ""} ${
                asistencia.apellido_usuario || ""
              }`}
              disabled
              readOnly
            />

            <h4 className="formulario-elemento">Hora de entrada</h4>
            <input
              type="time"
              className="formulario-input"
              {...register("hora_entrada", { required: true })}
            />
            {errors.hora_entrada && <CampoRequerido />}

            <h4 className="formulario-elemento">Hora de salida</h4>
            <input
              type="time"
              className="formulario-input"
              {...register("hora_salida", {
                validate: (value) => {
                  if (!value || !horaEntrada) return true;
                  if (value <= horaEntrada) {
                    return "La hora de salida debe ser posterior a la de entrada";
                  }
                  return true;
                },
              })}
            />
            {errors.hora_salida && (
              <MostrarError errores={errors.hora_salida.message} />
            )}
          </fieldset>

          {puedeEditar && (
            <div className="botones-grupo mt-4">
              <button type="submit" className="boton-guardar">
                Guardar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
