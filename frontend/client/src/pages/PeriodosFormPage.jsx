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
    <div className="formulario">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">
          {params.id
            ? "Detalles del Período de Inscripción"
            : "Nuevo Período de Inscripción"}
        </h1>

        <form onSubmit={onSubmit}>
          <div>
            <label className="formulario-elemento">Fecha de inicio:</label>
            <input
              type="datetime-local"
              {...register("fecha_inicio", { required: true })}
              className="formulario-input"
              disabled={!esNuevo}
            />

            {errors.fecha_inicio && <CampoRequerido />}
          </div>

          <div>
            <label className="formulario-elemento">Fecha de fin:</label>
            <input
              type="datetime-local"
              {...register("fecha_fin", { required: true })}
              className="formulario-input"
              disabled={!editable}
            />
            {errors.fecha_fin && <CampoRequerido />}
          </div>

          <br />
          <div className="botones-grupo">
            {esPeriodoEditable && !editable && (
              <button
                type="button"
                className="boton-editar"
                onClick={() => setEditable(true)}
              >
                Editar
              </button>
            )}

            {(esNuevo || esPeriodoEditable) && editable && (
              <>
                <button type="submit" className="boton-guardar">
                  Guardar
                </button>
                {!esNuevo && (
                  <button
                    type="button"
                    onClick={cerrarPeriodoActual}
                    className="boton-eliminar"
                  >
                    Cerrar período
                  </button>
                )}
              </>
            )}
          </div>

          {errorBackend && <MostrarError errores={errorBackend} />}
        </form>
      </div>
    </div>
  );
}
