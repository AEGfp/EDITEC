import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { obtenerSalas, eliminarSala } from "../api/salas.api";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";

export default function ListaSalasTable() {
  const navigate = useNavigate();
  const [salas, setSalas] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const puedeEscribir = tienePermiso("salas", "escritura");

  useEffect(() => {
    async function loadSalas() {
      try {
        const res = await obtenerSalas();

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
          setSalas(res.data);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error al cargar salas:", error);
        setLoading(false);
      }
    }

    loadSalas();
  }, []);

  function agregarBotonDetalles(arrayColumnas) {
    arrayColumnas.push({
      name: "",
      selector: (fila) => fila,
      right: true,
      cell: (fila) => (
        <div className="flex gap-2">
          <button
            className="boton-detalles"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/salas/${fila.id}`);
            }}
          >
            Detalles
          </button>
          <button
            className="boton-eliminar bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            onClick={async (e) => {
              e.stopPropagation();
              const confirmar = window.confirm("¿Seguro que deseas eliminar esta sala?");
              if (confirmar) {
                try {
                  await eliminarSala(fila.id);
                  setSalas((prev) => prev.filter((s) => s.id !== fila.id));
                } catch (err) {
                  console.error("Error al eliminar sala:", err);
                }
              }
            }}
          >
            Eliminar
          </button>
        </div>
      ),
    });
  }

  const elementosFiltrados = salas.filter((sala) =>
    columnas.some((columna) => {
      const elem = columna.selector(sala);
      return elem?.toString().toLowerCase().includes(busqueda.toLowerCase());
    })
  );

  const paginationComponentOptions = {
    rowsPerPageText: "Filas por página",
    rangeSeparatorText: "de",
    selectAllRowsItem: true,
    selectAllRowsItemText: "Todas",
  };

  return (
    <div>
      <h1 className="align-baseline text-2xl font-semibold p-2 pl-3">
        Salas
      </h1>
      <div className="p-2 flex flex-row justify-between">
        <button
          className="boton-guardar ml-2"
          onClick={() => {
            const periodo = sessionStorage.getItem("id_periodo");
            const url = `http://localhost:8000/api/educativo/reporte-asignacion-aulas/?periodo_id=${periodo}`;
            window.open(url, "_blank");
          }}
        >
          Generar Reporte
        </button>

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
            onClick={() => navigate("/salas-crear")}
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
