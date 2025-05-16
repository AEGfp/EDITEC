import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { obtenerTurnos } from "../api/turnos.api";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";

export default function TurnosList() {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const puedeEscribir = tienePermiso("turnos", "escritura");

  useEffect(() => {
    async function loadTurnos() {
      try {
        const res = await obtenerTurnos();

        if (res.data.length > 0) {
          const arrayColumnas = [
            {
              name: "Descripción",
              selector: (fila) => fila.descripcion,
              sortable: true,
              cell: (fila) => fila.descripcion,
            },
          ];

          agregarBotonDetalles(arrayColumnas);
          setColumnas(arrayColumnas);
          setTurnos(res.data);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error al cargar turnos:", error);
        setLoading(false);
      }
    }

    loadTurnos();
  }, []);

  function agregarBotonDetalles(arrayColumnas) {
    arrayColumnas.push({
      name: "",
      selector: (fila) => fila,
      right: true,
      cell: (fila) => (
        <button
          className="boton-detalles"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/turnos/${fila.id}`);
          }}
        >
          Detalles
        </button>
      ),
    });
  }

  const elementosFiltrados = turnos.filter((turno) =>
    columnas.some((columna) => {
      const valor = columna.selector(turno);
      return valor?.toString().toLowerCase().includes(busqueda.toLowerCase());
    })
  );

  const paginationComponentOptions = {
    rowsPerPageText: "Filas por página",
    rangeSeparatorText: "de",
    selectAllRowsItem: true,
    selectAllRowsItemText: "Todos",
  };

  return (
    <div>
      <h1 className="align-baseline text-2xl font-semibold p-2 pl-3">
        Turnos
      </h1>
      <div className="p-2 flex flex-row justify-between">
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 w-full max-w-xs"
        />
        {puedeEscribir && (
          <button
            className="boton-guardar items-end"
            onClick={() => navigate("/turnos-crear")}
          >
            Agregar...
          </button>
        )}
      </div>

      <DataTable
        columns={columnas}
        data={elementosFiltrados}
        progressPending={loading}
        pagination
        paginationComponentOptions={paginationComponentOptions}
        highlightOnHover
        customStyles={estiloTablas}
      />
    </div>
  );
}
