import { useEffect, useState } from "react";
//import { obtenerSalasPorHorario } from "../api/salas.api";
import { obtenerSalasPublicas } from "../api/salas.api";

export default function SeleccionSala({ register, watch, setValue }) {
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(false);

  //  const horaEntrada = watch("hora_entrada");
  //  const horaSalida = watch("hora_salida");

  useEffect(() => {
    const cargarSalas = async () => {
      //   if (horaEntrada && horaSalida) {
      setLoading(true);
      try {
        //const { data } = await obtenerSalasPorHorario(horaEntrada, horaSalida);
        const { data } = await obtenerSalasPublicas();
        setSalas(data);
      } catch (error) {
        console.error("Error al cargar salas por horario", error);
      } finally {
        setLoading(false);
      }
      //  }
    };

    cargarSalas();
    //  }, [horaEntrada, horaSalida]);
  }, []);

  return (
    <div>
      <h2 className="formulario-titulo">Selección de Sala</h2>
      {loading ? (
        <p>Cargando salas disponibles...</p>
      ) : salas.length > 0 ? (
        <select
          className="formulario-input"
          {...register("id_sala", { required: true })}
        >
          <option value="">Seleccione una sala</option>
          {salas.map((sala) => (
            <option key={sala.id} value={sala.id}>
              {sala.descripcion} - Prof. {sala.nombre_profesor}
            </option>
          ))}
        </select>
      ) : (
        <p>No hay salas disponibles para el horario ingresado.</p>
      )}
    </div>
  );
}
