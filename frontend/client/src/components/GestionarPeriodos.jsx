import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  crearPeriodoInscripcion,
  cerrarPeriodo,
  obtenerUltimoPeriodo,
} from "../api/periodos.api";

export default function GestionarPeriodos({
  periodo,
  hayPeriodoActivo,
  actualizarPeriodo,
}) {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const onSubmit = async (data) => {
    setMensaje("");
    const inicio = new Date(data.fecha_inicio);
    const fin = new Date(data.fecha_fin);

    if (fin <= inicio) {
      setMensaje("La fecha de fin debe ser posterior a la fecha de inicio.");
      return;
    }
    const diferenciaMs = fin - inicio;
    const dias = diferenciaMs / (1000 * 60 * 60 * 24);
    if (dias > 31) {
      setMensaje("El período no puede superar 1 mes (31 días).");
      return;
    }

    setLoading(true);
    try {
      const res = await crearPeriodoInscripcion(data);
      actualizarPeriodo(res.data);
      setMensaje("Período creado exitosamente.");
      reset();
      setMostrarFormulario(false);
    } catch (error) {
      setMensaje(
        error.response?.data?.detail ||
          "Error al crear el período de inscripción."
      );
    } finally {
      setLoading(false);
    }
  };

  const cerrarPeriodoActual = async () => {
    setMensaje("");
    setLoading(true);
    try {
      await cerrarPeriodo(periodo.id);
      const res = await obtenerUltimoPeriodo();
      actualizarPeriodo(res.data);
      if (res?.data?.id) {
        sessionStorage.setItem("id_periodo", res.data.id);
      }
      setMensaje("Período cerrado correctamente.");
    } catch (error) {
      setMensaje("Error al cerrar el período.");
    } finally {
      setLoading(false);
    }
  };

  const ahora = new Date();
  const esPendiente = periodo && new Date(periodo.fecha_inicio) > ahora;
  const estaActivo = hayPeriodoActivo;

  const mostrarCierre = estaActivo;
  const mostrarCrear = !estaActivo && !esPendiente;

  const formatearFecha = (fechaStr) =>
    new Date(fechaStr).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  if (mostrarCierre) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between bg-gray-100 border border-gray-300 px-4 py-2 rounded">
          <span>
            <strong>Período activo:</strong>{" "}
            {formatearFecha(periodo.fecha_inicio)} —{" "}
            {formatearFecha(periodo.fecha_fin)}
          </span>
          <button
            onClick={cerrarPeriodoActual}
            disabled={loading}
            className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Cerrar período
          </button>
        </div>
        {mensaje && (
          <p className="text-sm text-red-600 mt-2 font-medium">{mensaje}</p>
        )}
      </div>
    );
  }

  if (esPendiente) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between bg-yellow-100 border border-yellow-300 px-4 py-2 rounded">
          <span>
            <strong>Período pendiente:</strong>{" "}
            {formatearFecha(periodo.fecha_inicio)} —{" "}
            {formatearFecha(periodo.fecha_fin)}
          </span>
        </div>
        {mensaje && (
          <p className="text-sm text-yellow-600 mt-2 font-medium">{mensaje}</p>
        )}
      </div>
    );
  }

  if (mostrarCrear && !mostrarFormulario) {
    return (
      <div className="mb-6">
        <button
          onClick={() => setMostrarFormulario(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Crear nuevo período
        </button>
        {mensaje && (
          <p className="text-sm text-red-600 mt-2 font-medium">{mensaje}</p>
        )}
      </div>
    );
  }

  if (mostrarFormulario) {
    return (
      <div className="formulario mb-6">
        <div className="formulario-dentro space-y-4">
          <h2 className="formulario-titulo">
            Crear nuevo período de inscripción
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="formulario-elemento">Fecha de inicio:</label>
              <input
                type="datetime-local"
                {...register("fecha_inicio", { required: true })}
                className="formulario-input"
              />
            </div>
            <div>
              <label className="formulario-elemento">Fecha de fin:</label>
              <input
                type="datetime-local"
                {...register("fecha_fin", { required: true })}
                className="formulario-input"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="boton-guardar"
                disabled={loading}
              >
                Crear período
              </button>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setMensaje("");
                  setMostrarFormulario(false);
                }}
                className="boton-cancelar"
              >
                Cancelar
              </button>
            </div>
          </form>

          {mensaje && (
            <p className="mensaje-error text-sm text-red-600 mt-2">{mensaje}</p>
          )}
        </div>
      </div>
    );
  }

  return null;
}
