import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { obtenerPeriodosInscripcion } from "../api/periodos.api";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import MostrarError from "../components/MostrarError";

export default function ListaPeriodos() {
  const navigate = useNavigate();
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [errorBackend, setErrorBackend] = useState(null);

  useEffect(() => {
    async function cargarPeriodos() {
      setLoading(true);
      setErrorBackend(null);
      try {
        const res = await obtenerPeriodosInscripcion();
        setPeriodos(res.data);
      } catch (error) {
        console.error("Error al cargar los periodos:", error);
        setErrorBackend(
          error.response?.data || {
            detail: "No se pudieron cargar los periodos.",
          }
        );
      } finally {
        setLoading(false);
      }
    }

    cargarPeriodos();
  }, []);

  const columnas = [
    {
      name: "Fecha de inicio",
      selector: (row) => row.fecha_inicio,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-12 bg-blue-300 rounded-full"></div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-700">
              {format(new Date(row.fecha_inicio), "dd MMM yyyy", { locale: es })}
            </span>
            <span className="text-sm text-gray-500">
              {format(new Date(row.fecha_inicio), "HH:mm", { locale: es })}
            </span>
          </div>
        </div>
      ),
      minWidth: "200px"
    },
    {
      name: "Fecha de fin",
      selector: (row) => row.fecha_fin,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center space-x-3">
<div className="w-2.5 h-12 bg-purple-300 rounded-full"></div>

          <div className="flex flex-col">
            <span className="font-medium text-gray-700">
              {format(new Date(row.fecha_fin), "dd MMM yyyy", { locale: es })}
            </span>
            <span className="text-sm text-gray-500">
              {format(new Date(row.fecha_fin), "HH:mm", { locale: es })}
            </span>
          </div>
        </div>
      ),
      minWidth: "200px"
    },
    {
      name: "Estado",
      selector: (row) => row.activo,
      sortable: true,
      cell: (row) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          row.activo 
            ? "bg-green-100 text-green-800" 
            : "bg-red-200 text-red-800"
          }`}>
          {row.activo ? (
            <>
              <span className="w-2 h-2 bg-green-800 rounded-full mr-2"></span>
              Activo
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Inactivo
            </>
          )}
        </span>
        
      ),
      center: true,
      minWidth: "120px"
    },
    {
      name: "Acciones",
      cell: (row) => (
        <button
          onClick={() => navigate(`/periodos/${row.id}`)}
          className="inline-flex items-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-sm transition-colors"
          >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          Detalles
        </button>
      ),
      right: true,
      minWidth: "120px"
    },
  ];

  function agregarElemento() {
    navigate(`/periodos-crear/`);
  }

  const periodosFiltrados = periodos.filter((periodo) =>
    columnas.some((col) => {
      const valor = col.selector ? col.selector(periodo) : null;
      return valor?.toString().toLowerCase().includes(busqueda.toLowerCase());
    })
  );

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-blue-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Períodos de Inscripción
            </h1>
            <p className="text-blue-600">Gestiona los períodos de inscripción para la guardería</p>
          </div>
          <button 
            onClick={agregarElemento}
            className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Nuevo período
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar períodos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            />
          </div>
        </div>

        {/* Error */}
        {errorBackend && (
          <div className="mb-6">
            <MostrarError errores={errorBackend} />
          </div>
        )}

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden border border-blue-100">
          <DataTable
            columns={columnas}
            data={periodosFiltrados}
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
                  backgroundColor: '#dbeafe', // azul pastel (Tailwind: blue-200)
                  borderBottom: '2px solid #3b82f6', // azul más fuerte para separar
                  minHeight: '56px',
                },
              },
              headCells: {
                style: {
                  color: '#1e3a8a', // azul oscuro (Tailwind: blue-900)
                  fontWeight: '500', // más suave que bold
                  fontSize: '15px',
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif', // Tailwind friendly font
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                },
              },
              rows: {
                style: {
                  '&:not(:last-of-type)': {
                    borderBottom: '1px solid #e5e7eb', // gris claro
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
                <h3 className="mt-2 text-sm font-medium text-blue-800">No hay períodos</h3>
                <p className="mt-1 text-sm text-blue-600 mb-4">Comienza creando un nuevo período de inscripción</p>
                <button
                  onClick={agregarElemento}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                >
                  Crear período
                </button>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}