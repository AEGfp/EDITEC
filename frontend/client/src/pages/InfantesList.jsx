import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { obtenerInfantes } from "../api/infantes.api";
import tienePermiso from "../utils/tienePermiso";

export default function ListaInfantes() {
  const navigate = useNavigate();
  const [infantes, setInfantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const puedeEscribir = tienePermiso("infantes", "escritura");

  useEffect(() => {
    async function cargarInfantes() {
      setLoading(true);
      try {
        const res = await obtenerInfantes();
        setInfantes(res.data);
      } catch (error) {
        console.error("Error cargando infantes:", error);
        setInfantes([]);
      } finally {
        setLoading(false);
      }
    }
    cargarInfantes();
  }, []);

  const columnas = [
    {
      name: "👶 Nombre",
      selector: (row) =>
        row.id_persona?.nombre && row.id_persona?.apellido
          ? `${row.id_persona.nombre} ${row.id_persona.apellido}`
          : "Desconocido",
      sortable: true,
    },
    {
      name: "",
      right: true,
      cell: (row) => (
        <button
          onClick={() => navigate(`/infantes/${row.id}`)}
          className="inline-flex items-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-sm transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          Detalles
        </button>
      ),
    },
  ];

  const infantesFiltrados = infantes.filter((i) =>
    columnas.some((col) => {
      const valor = col.selector?.(i);
      return valor?.toString().toLowerCase().includes(busqueda.toLowerCase());
    })
  );

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-blue-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              👶 Infantes registrados
            </h1>
            <p className="text-blue-600">Listado general de infantes del sistema</p>
          </div>
          {puedeEscribir && (
            <button 
              onClick={() => navigate("/infantes-crear")}
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Nuevo Infante
            </button>
          )}
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
              placeholder="Buscar infantes..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden border border-blue-100">
          <DataTable
            columns={columnas}
            data={infantesFiltrados}
            progressPending={loading}
            pagination
            paginationComponentOptions={{
              rowsPerPageText: "Filas por página:",
              rangeSeparatorText: "de",
              selectAllRowsItem: true,
              selectAllRowsItemText: "Todos",
            }}
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
            highlightOnHover
            noDataComponent={
              <div className="p-8 text-center text-blue-600">
                <svg className="mx-auto h-12 w-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-blue-800">No hay infantes</h3>
                <p className="mt-1 text-sm text-blue-600 mb-4">Actualmente no se registraron infantes en el sistema</p>
                {puedeEscribir && (
                  <button
                    onClick={() => navigate("/infantes-crear")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                  >
                    Crear infante
                  </button>
                )}
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
