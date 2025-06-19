import { useNavigate, useParams } from "react-router-dom";
import ConsultarInfantes from "./ConsultarInfantes";
import ConsultarTutores from "./ConsultarTutores";
import { useEffect, useState } from "react";
import {
  obtenerInscripcion,
  aceptarInscripcion,
  rechazarInscripcion,
} from "../api/inscripciones.api";
import { generarCuota } from "../api/saldocuotas.api";
import ConsultarArchivos from "./ConsultarArchivos";

export default function ConsultarInscripcion() {
  const { id } = useParams();
  const [inscripcion, setInscripcion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadInscripcion() {
      try {
        if (!id) return;
        const res = await obtenerInscripcion(id);
        console.log(res.data);
        setInscripcion(res.data);
      } catch (err) {
        console.error(err);
        setError("Error al obtener la inscripión");
      } finally {
        setLoading(false);
      }
    }
    loadInscripcion();
  }, [id]);

  if (!id) {
    return (
      <div>
        <h1 className="mensaje-error">no se recibió una inscripción</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h1>Cargando...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mensaje-error">{error}</h1>
      </div>
    );
  }

  async function manejarAceptar(id) {
    setProcesando(true);
    try {
      const res = await aceptarInscripcion(id);
      console.log("Inscripción aceptada");
      navigate("/inscripciones/");
    } catch (error) {
      console.log("Error al intentar aceptar la inscripción", error);
    } finally {
      setProcesando(false);
    }
  }

  async function manejarRechazar(id) {
    setProcesando(true);
    try {
      const res = await rechazarInscripcion(id);
      console.log("Inscripción rechazada");
      navigate("/inscripciones/");
    } catch (error) {
      console.log("Error al intentar rechazar la inscripción", error);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-center items-start gap-4">
        <div className="max-w-lg w-full">
          <ConsultarInfantes
            idInfante={inscripcion.id_infante}
          ></ConsultarInfantes>
        </div>

        <div className="max-w-lg w-full">
          <ConsultarTutores idTutor={inscripcion.id_tutor}></ConsultarTutores>
        </div>

        <div className="max-w-lg w-full ">
          <ConsultarArchivos
            id_persona_infante={inscripcion.id_persona_infante}
          ></ConsultarArchivos>
        </div>
      </div>
      {inscripcion.estado === "pendiente" && (
        <div className="botones-grupo mt-4 ">
          <button
            disabled={procesando}
            className="boton-guardar px-8 py-3 text-lg"
            onClick={() => {  generarCuota(inscripcion);
                              manejarAceptar(inscripcion.id);}}
          >
            Aprobar
          </button>
          <br />
          <button
            disabled={procesando}
            className="boton-eliminar px-8 py-3 text-lg"
            onClick={() => manejarRechazar(inscripcion.id)}
          >
            Rechazar
          </button>
        </div>
      )}
    </>
  );
}
