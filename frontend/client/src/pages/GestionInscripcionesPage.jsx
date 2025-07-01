import { useEffect, useState } from "react";
import GestionarPeriodos from "../components/GestionarPeriodos";
import ListaInscripciones from "../components/ListaInscripciones";
import {
  obtenerPeriodoActivo,
  obtenerUltimoPeriodo,
} from "../api/periodos.api";
import { limpiarInscripciones } from "../api/inscripciones.api";
import { useNavigate } from "react-router-dom";
import ReporteInscripcionesPage from "./ReporteInscripcionesPage";

export default function GestionarInscripcionesPage() {
  const [periodo, setPeriodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const navigate = useNavigate();

  const cargarPeriodo = async () => {
    setLoading(true);
    setMensaje("");
    try {
      const resActivo = await obtenerPeriodoActivo();
      setPeriodo(resActivo.data);

      //Revisar activar/desactivar
      const ahora = new Date();
      const fin = new Date(resActivo.data.fecha_fin);
      if (resActivo.data.activo && ahora < fin) {
        setMostrarFormulario(true);
      }
    } catch (errActivo) {
      try {
        const resUltimo = await obtenerUltimoPeriodo();
        setPeriodo(resUltimo.data);
      } catch (errUltimo) {
        setPeriodo(null);
        setMensaje("No hay períodos de inscripción disponibles.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPeriodo();
  }, []);

  const actualizarPeriodo = (nuevoPeriodo) => {
    setPeriodo(nuevoPeriodo);
    setMensaje("");
    setMostrarFormulario(false);
    if (nuevoPeriodo?.id) {
      sessionStorage.setItem("id_periodo", nuevoPeriodo.id);
    } else {
      sessionStorage.removeItem("id_periodo");
    }
  };

  async function manejarEliminar() {
    try {
      const res = await limpiarInscripciones();
      console.log("Inscripciones eliminadas");
      navigate("/inscripciones/");
    } catch (error) {
      console.log("Error al intentar eliminar las inscripciones", error);
      alert("No se pudo eliminar las inscripciones rechazadas y pendientes.");
    }
  }

  const ahora = new Date();
  const fechaFin = periodo ? new Date(periodo.fecha_fin) : null;
  const hayPeriodoActivo = periodo?.activo === true && fechaFin > ahora;
  const mostrarBotonEliminar =
    !hayPeriodoActivo && periodo && new Date(periodo.fecha_inicio) < ahora;

  const mensajeDinamico = () => {
    if (!periodo) return "No hay períodos de inscripción disponibles.";
    if (hayPeriodoActivo) return "";
    const inicio = new Date(periodo.fecha_inicio);
    const ahora = new Date();
    if (inicio > ahora) return "Hay un período pendiente por comenzar.";
    return "No hay un período activo. Se muestran las inscripciones del último período.";
  };

  if (loading) return <p>Cargando período de inscripción...</p>;

  return (
    <div className="px-6 py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold p-2 pl-3">Periodo</h1>
        <button
          onClick={() => setMostrarFormulario((prev) => !prev)}
          className={mostrarFormulario ? "boton-eliminar" : "boton-detalles"}
        >
          {mostrarFormulario ? "Cancelar" : "Ver período"}
        </button>
      </div>

      {mostrarFormulario && (
        <GestionarPeriodos
          periodo={periodo}
          hayPeriodoActivo={hayPeriodoActivo}
          actualizarPeriodo={actualizarPeriodo}
        />
      )}

      {(mensaje || mensajeDinamico()) && (
        <div className="my-4 text-yellow-700 bg-yellow-100 border border-yellow-300 rounded px-4 py-2 flex justify-between items-center">
          <span>{mensaje || mensajeDinamico()}</span>
          <ReporteInscripcionesPage estado="rechazada" />
          {mostrarBotonEliminar && (
            <button
              className="boton-eliminar"
              onClick={() => {
                manejarEliminar();
              }}
            >
              Eliminar inscripciones rechazadas y pendientes
            </button>
          )}
        </div>
      )}

      {periodo ? (
        <ListaInscripciones periodo={periodo} />
      ) : (
        <p className="text-center text-gray-500 mt-6">
          No hay inscripciones disponibles para mostrar.
        </p>
      )}
    </div>
  );
}
