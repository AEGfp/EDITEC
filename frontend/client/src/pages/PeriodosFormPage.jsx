import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  crearPeriodoInscripcion,
  obtenerPeriodoDetalle,
  actualizarPeriodo,
  cerrarPeriodo,
  obtenerUltimoPeriodo,
} from "../api/periodos.api";
import CampoRequerido from "../components/CampoRequerido";
import MostrarError from "../components/MostrarError";
import tienePermiso from "../utils/tienePermiso";

export default function PeriodosFormPage() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const params = useParams();
  const esNuevo = !params.id;

  const [editable, setEditable] = useState(false);
  const [errorBackend, setErrorBackend] = useState(null);
  const [periodoIdSession, setPeriodoIdSession] = useState(null);

  const puedeEscribir = tienePermiso("periodos", "escritura");

  useEffect(() => {
    const id_periodo = sessionStorage.getItem("id_periodo");
    setPeriodoIdSession(id_periodo);

    async function cargarPeriodo() {
      console.log(sessionStorage.getItem("id_periodo"));
      if (params.id) {
        try {
          const { data } = await obtenerPeriodoDetalle(params.id);
          setValue("fecha_inicio", data.fecha_inicio.slice(0, 16));
          setValue("fecha_fin", data.fecha_fin.slice(0, 16));
        } catch (error) {
          console.error("Error al cargar periodo:", error);
        }
      } else {
        setEditable(true);
      }
    }

    cargarPeriodo();
  }, [params.id, setValue]);

  const esPeriodoEditable = puedeEscribir && periodoIdSession === params.id;

  const onSubmit = handleSubmit(async (data) => {
    setErrorBackend(null);

    const inicio = new Date(data.fecha_inicio);
    const fin = new Date(data.fecha_fin);

    if (fin <= inicio) {
      setErrorBackend({
        fecha_fin: ["La fecha de fin debe ser posterior a la fecha de inicio."],
      });
      return;
    }

    const diferenciaMs = fin - inicio;
    const dias = diferenciaMs / (1000 * 60 * 60 * 24);
    if (dias > 31) {
      setErrorBackend({
        fecha_fin: ["El período no puede superar 1 mes (31 días)."],
      });
      return;
    }

    try {
      if (params.id) {
        await actualizarPeriodo(params.id, data);
      } else {
        await crearPeriodoInscripcion(data);
      }
      navigate("/periodos");
    } catch (error) {
      setErrorBackend(error.response?.data || "Error desconocido");
    }
  });

  const cerrarPeriodoActual = async () => {
    const confirmar = window.confirm(
      "¿Estás seguro que deseas cerrar este período? Esta acción no se puede deshacer."
    );
    if (!confirmar) return;

    setErrorBackend(null);
    try {
      await cerrarPeriodo(params.id);
      const periodo = await obtenerUltimoPeriodo();
      if (periodo?.data?.id) {
        sessionStorage.setItem("id_periodo", periodo.data.id);
      }
      navigate("/periodos");
    } catch (error) {
      setErrorBackend(error.response?.data || "No se pudo cerrar el período.");
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-xl mx-auto bg-white shadow rounded-xl p-6 border border-blue-100">
        <h1 className="text-xl font-bold text-white text-center bg-blue-600 py-3 rounded-md mb-6">
          {params.id
            ? "Detalles del Período de Inscripción"
            : "Nuevo Período de Inscripción"}
        </h1>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Fecha inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de inicio:
            </label>
            <input
              type="datetime-local"
              {...register("fecha_inicio", { required: true })}
              className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={!esNuevo}
            />
            {errors.fecha_inicio && <CampoRequerido />}
          </div>

          {/* Fecha fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de fin:
            </label>
            <input
              type="datetime-local"
              {...register("fecha_fin", { required: true })}
              className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={!editable}
            />
            {errors.fecha_fin && <CampoRequerido />}
          </div>

          {/* Errores backend */}
          {errorBackend && (
            <div className="pt-2">
              <MostrarError errores={errorBackend} />
            </div>
          )}

   {/* Botones */}
   <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
   <button
  type="submit"
  className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-base font-bold rounded-lg shadow transition duration-150"
>
  Guardar
</button>

  {!esNuevo && (
    <button
      type="button"
      onClick={cerrarPeriodoActual}
      className="inline-flex items-center justify-center px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg shadow transition duration-150"
    >
      Cerrar período
    </button>
  )}
</div>

        </form>
      </div>
    </div>
  );
}
