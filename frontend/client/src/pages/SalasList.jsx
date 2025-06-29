import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { obtenerSalas, eliminarSala } from "../api/salas.api";
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
              name: "🏷️ Descripción",
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
      name: "⚙️ Acciones",
      selector: (fila) => fila,
      right: true,
      cell: (fila) => (
        <div className="flex gap-2">
          <button
            className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/salas/${fila.id}`);
            }}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Detalles
          </button>
          <button
            className="inline-flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
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
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22" />
            </svg>
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

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-800 flex items-center">
              🏫 Salas
            </h1>
            <p className="text-blue-600">Revisa y gestiona las salas disponibles</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-sm"
              onClick={() => {
                const periodo = sessionStorage.getItem("id_periodo");
                const url = `http://localhost:8000/api/educativo/reporte-asignacion-aulas/?periodo_id=${periodo}`;
                window.open(url, "_blank");
              }}
            >
              📄 Reporte salas
            </button>
            {puedeEscribir && (
              <button
                onClick={() => navigate("/salas-crear")}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow-sm"
              >
                ➕ Nueva sala
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar salas..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden border border-blue-100">
          <DataTable
            columns={columnas}
            data={elementosFiltrados}
            progressPending={loading}
            pagination
            paginationComponentOptions={{
              rowsPerPageText: "Filas por página",
              rangeSeparatorText: "de",
              selectAllRowsItem: true,
              selectAllRowsItemText: "Todas",
            }}
            highlightOnHover
            customStyles={{
              headRow: {
                style: {
                  backgroundColor: '#dbeafe',
                  borderBottom: '2px solid #3b82f6',
                  minHeight: '56px',
                },
              },
              headCells: {
                style: {
                  color: '#1e3a8a',
                  fontWeight: '500',
                  fontSize: '15px',
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                },
              },
              rows: {
                style: {
                  '&:not(:last-of-type)': {
                    borderBottom: '1px solid #e5e7eb',
                  },
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                  },
                },
              },
              cells: {
                style: {
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
