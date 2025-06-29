import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import tienePermiso from "../utils/tienePermiso";
import {
  crearReporteInforme,
  obtenerTodosInformes,
} from "../api/informes.api";

export function ListaInformes() {
  const navigate = useNavigate();
  const [informes, setInformes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const puedeEscribir = tienePermiso("informes", "escritura");

  useEffect(() => {
    async function loadInformes() {
      setLoading(true);
      try {
        const res = await obtenerTodosInformes();
        setInformes(res.data);
      } catch (err) {
        console.error("Error al cargar los informes", err);
      } finally {
        setLoading(false);
      }
    }
    loadInformes();
  }, []);

  const columnas = [
    {
      name: "👶 Infante",
      selector: (row) => row.nombre_infante || "",
      sortable: true,
    },
    {
      name: "📄 Tipo Informe",
      selector: (row) => row.descripcion_tipo_informe || "",
      sortable: true,
    },
    {
      name: "📅 Fecha Informe",
      selector: (row) => row.fecha_informe,
      sortable: true,
      cell: (row) => new Date(row.fecha_informe).toLocaleDateString(),
    },
    {
      name: "👁️ Ver",
      cell: (row) => (
        <button
          onClick={() => handleRowClick(row)}
          className="inline-flex items-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-sm transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          Ver PDF
        </button>
      ),
      right: true,
    },
  ];
  
  async function handleRowClick(fila) {
    try {
      const res = await crearReporteInforme(fila.id);
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      window.open(url, "_blank");
    } catch (err) {
      console.error("Error al obtener el informe PDF", err);
    }
  }

  function agregarElemento() {
    navigate("/crear-informe/");
  }

  const elementosFiltrados = informes.filter((informe) =>
    columnas.some((columna) => {
      const elem = columna.selector ? columna.selector(informe) : null;
      return elem?.toString().toLowerCase().includes(busqueda.toLowerCase());
    })
  );

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-blue-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Informes Generados
            </h1>
            <p className="text-blue-600">Revisa y descarga los informes de los infantes</p>
          </div>
          {puedeEscribir && (
            <button 
              onClick={agregarElemento}
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Nuevo Informe
            </button>
          )}
        </div>

        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar informes..."
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
              <div className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-blue-800">No hay informes</h3>
                <p className="mt-1 text-sm text-blue-600 mb-4">Comienza generando un nuevo informe</p>
                {puedeEscribir && (
                  <button
                    onClick={agregarElemento}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                  >
                    Crear informe
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
