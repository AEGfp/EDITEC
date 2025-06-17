import { useEffect, useState } from "react";
import GestionarPeriodos from "../components/GestionarPeriodos";
import ListaInscripciones from "../components/ListaInscripciones";
import {
  obtenerPeriodoActivo,
  obtenerUltimoPeriodo,
} from "../api/periodos.api";

export default function GestionarInscripcionesPage() {
  const [periodo, setPeriodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const cargarPeriodo = async () => {
    setLoading(true);
    setMensaje("");
    try {
      // Intento obtener el periodo activo
      const resActivo = await obtenerPeriodoActivo();
      setPeriodo(resActivo.data);
      // No seteamos hayPeriodoActivo por separado; lo derivamos abajo
    } catch (errActivo) {
      try {
        // Si no hay periodo activo, obtengo el último
        const resUltimo = await obtenerUltimoPeriodo();
        setPeriodo(resUltimo.data);
      } catch (errUltimo) {
        // No hay ningún período
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

  // Actualiza el período y limpia mensajes
  const actualizarPeriodo = (nuevoPeriodo) => {
    setPeriodo(nuevoPeriodo);
    setMensaje("");
  };

  const ahora = new Date();
  const fechaFin = periodo ? new Date(periodo.fecha_fin) : null;

  // Derivo si hay período activo para mensajes y lógica
  const hayPeriodoActivo = periodo?.activo === true && fechaFin > ahora;

  // Mensaje dinámico según estado del período
  const mensajeDinamico = () => {
    if (!periodo) return "No hay períodos de inscripción disponibles.";
    if (hayPeriodoActivo) return ""; // No muestro mensaje si hay período activo
    const inicio = new Date(periodo.fecha_inicio);
    const ahora = new Date();
    if (inicio > ahora) return "Hay un período pendiente por comenzar.";
    return "No hay un período activo. Se muestran las inscripciones del último período.";
  };

  if (loading) return <p>Cargando período de inscripción...</p>;

  return (
    <div className="px-6 py-4">
      <GestionarPeriodos
        periodo={periodo}
        hayPeriodoActivo={hayPeriodoActivo}
        actualizarPeriodo={actualizarPeriodo}
      />

      {mensaje || mensajeDinamico() ? (
        <div className="my-4 text-yellow-700 bg-yellow-100 border border-yellow-300 rounded px-4 py-2">
          {mensaje || mensajeDinamico()}
        </div>
      ) : null}

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
