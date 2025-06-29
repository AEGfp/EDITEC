import { useNavigate } from "react-router-dom";
import { obtenerTodasAsistencias } from "../api/asistencias.api";
import { useEffect, useState } from "react";
import ReporteAsistencia from "../components/ReporteAsistencia";
import DataTable from "react-data-table-component";
import { estiloTablas } from "../assets/estiloTablas";

export default function AsistenciasHistorial() {
  const navigate = useNavigate();
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  useEffect(() => {
    async function cargarAsistencias() {
      try {
        const res = await obtenerTodasAsistencias();
        setAsistencias(res.data);
      } catch (error) {
        console.error("Error cargando asistencias:", error);
      } finally {
        setLoading(false);
      }
    }

    cargarAsistencias();
  }, []);

  const columnas = [
    {
      name: "📅 Fecha",
      selector: (row) => row.fecha,
      format: (row) => row.fecha_formateada || "-",
      sortable: true,
    },
    {
      name: "🧒 Nombre",
      selector: (row) => `${row.nombre_infante} ${row.apellido_infante || ""}`.trim(),
      sortable: true,
    },
    {
      name: "📌 Estado",
      selector: (row) =>
        row.estado ? row.estado.charAt(0).toUpperCase() + row.estado.slice(1) : "Sin marcar",
      sortable: true,
    },
    {
      name: "🕓 Entrada",
      selector: (row) => row.hora_entrada_formateada || "--:--",
      sortable: true,
    },
    {
      name: "🕔 Salida",
      selector: (row) => row.hora_salida_formateada || "--:--",
      sortable: true,
    },
    {
      name: "👤 Registrado por",
      selector: (row) =>
        row.nombre_usuario && row.apellido_usuario
          ? `${row.nombre_usuario} ${row.apellido_usuario}`
          : "N/A",
      sortable: true,
    },
    {
      name: "👁️",
      cell: (row) => (
        <button
          onClick={() => navigate(`/asistencias-historial/${row.id}`)}
          className="inline-flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md shadow"
        >
          Detalles
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const elementosFiltrados = asistencias
    .filter((row) => {
      if (fechaDesde && row.fecha < fechaDesde) return false;
      if (fechaHasta && row.fecha > fechaHasta) return false;
      return true;
    })
    .filter((row) =>
      columnas
        .filter((col) => typeof col.selector === "function")
        .some((col) => {
          const valor = col.selector(row);
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
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-800 flex items-center mb-1">
            📝 Historial de Asistencias
          </h1>
          <p className="text-blue-600">
            Visualiza y edita el historial de asistencias de los infantes
          </p>
        </div>

        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar asistencias..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              />
            </div>

            <label className="flex items-center">
              Desde:
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="ml-1 border border-gray-300 rounded px-2 py-1"
              />
            </label>

            <label className="flex items-center">
              Hasta:
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="ml-1 border border-gray-300 rounded px-2 py-1"
              />
            </label>
          </div>

          <ReporteAsistencia fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
        </div>

        <div className="bg-white border border-blue-100 rounded-lg shadow overflow-hidden">
          <DataTable
            columns={columnas}
            data={elementosFiltrados}
            progressPending={loading}
            highlightOnHover
            pointerOnHover
            customStyles={estiloTablas}
            paginationComponentOptions={paginationComponentOptions}
            pagination
            defaultSortField="fecha"
            defaultSortAsc={true}
          />
        </div>
      </div>
    </div>
  );
}
