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
    <div className="min-h-screen bg-blue-50 flex justify-center items-center py-10">
      <div className="bg-white rounded-xl shadow-md w-full max-w-xl p-6">
        <div className="bg-blue-100 rounded-md px-4 py-2 mb-6 text-center">
          <h2 className="text-lg font-bold text-blue-700 flex items-center justify-center gap-2">
            📝 Detalle de Asistencia
          </h2>
        </div>

        <form onSubmit={onSubmit} id="form-asistencia" className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Nombre del infante</label>
            <input
              className="formulario-input"
              value={`${asistencia.nombre_infante} ${asistencia.apellido_infante}`}
              disabled
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Fecha</label>
            <input
              className="formulario-input"
              value={asistencia.fecha_formateada}
              disabled
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Estado</label>
            <input
              className="formulario-input"
              value={asistencia.estado}
              disabled
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Registrado por</label>
            <input
              className="formulario-input"
              value={`${asistencia.nombre_usuario || ""} ${
                asistencia.apellido_usuario || ""
              }`}
              disabled
              readOnly
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Hora de entrada</label>
              <input
                type="time"
                className="formulario-input"
                {...register("hora_entrada", { required: true })}
                disabled={!puedeEditar}
              />
              {errors.hora_entrada && <CampoRequerido />}
            </div>
            <div>
              <label className="block mb-1 font-medium">Hora de salida</label>
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
                disabled={!puedeEditar}
              />
              {errors.hora_salida && (
                <MostrarError errores={errors.hora_salida.message} />
              )}
            </div>
          </div>

          {puedeEditar && (
            <div className="flex justify-center mt-6">
              <button type="submit" className="boton-guardar">
                💾 Guardar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}