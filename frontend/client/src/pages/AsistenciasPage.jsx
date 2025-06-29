import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";
import {
  marcarPresente,
  marcarAusente,
  obtenerInfantesAsignados,
  marcarSalida,
} from "../api/asistencias.api";
import ReporteAsistencia from "../components/ReporteAsistencia";

export default function AsistenciasPage() {
  const navigate = useNavigate();
  const [infantes, setInfantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marcando, setMarcando] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    async function cargarInfantes() {
      try {
        const res = await obtenerInfantesAsignados();
        console.log(res.data);
        setInfantes(res.data);
      } catch (error) {
        console.error("Error cargando infantes:", error);
      } finally {
        setLoading(false);
      }
    }

    cargarInfantes();
  }, [marcando]);

  const marcarAsistencia = async (id, estado) => {
    setMarcando(true);
    try {
      if (estado === "presente") await marcarPresente(id);
      else await marcarAusente(id);
    } catch (error) {
      console.error(error);
    } finally {
      setMarcando(false);
    }
  };

  function handleRowClick(fila) {
    console.log("Click en infante", fila);
  }

  const registrarSalida = async (id) => {
    setMarcando(true);
    try {
      const res = await marcarSalida(id);
    } catch (error) {
      console.error("Error al intentar marcar la salida: ", error);
    } finally {
      setMarcando(false);
    }
  };
  const columnas = [
    {
      name: "👶 Infante",
      selector: (row) =>
        row.infante.id_persona
          ? `${row.infante.id_persona.nombre} ${row.infante.id_persona.apellido}`
          : "Sin nombre",
      sortable: true,
    },
    {
      name: "🏠 Sala",
      selector: (row) => row.infante.nombre_sala || "Sin sala",
      sortable: true,
    },
    {
      name: "📅 Estado",
      selector: (row) =>
        row.asistencia?.estado
          ? row.asistencia.estado.charAt(0).toUpperCase() + row.asistencia.estado.slice(1)
          : "Sin marcar",
      sortable: true,
    },
    {
      name: "🕒 Entrada",
      selector: (row) => {
        const hora = row.asistencia?.hora_entrada;
        if (!hora) return "--:--";
        const [hh, mm] = hora.split(":");
        return `${hh}:${mm}`;
      },
      sortable: true,
    },
    {
      name: "🕕 Salida",
      selector: (row) => {
        const hora = row.asistencia?.hora_salida;
        if (!hora) return "--:--";
        const [hh, mm] = hora.split(":");
        return `${hh}:${mm}`;
      },
      sortable: true,
    },
    {
      name: "👤 Registrado por",
      selector: (row) =>
        row.asistencia?.nombre_usuario && row.asistencia?.apellido_usuario
          ? `${row.asistencia.nombre_usuario} ${row.asistencia.apellido_usuario}`
          : "N/A",
      sortable: true,
    },
    {
      name: "⚙️ Acción",
      cell: (row) => {
        const asistencia = row.asistencia;
        if (!asistencia?.estado) {
          return (
            <div className="flex gap-2">
              <button
                className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded-md"
                onClick={() => marcarAsistencia(row.infante.id, "presente")}
              >
                ✅ Presente
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-md"
                onClick={() => marcarAsistencia(row.infante.id, "ausente")}
              >
                ❌ Ausente
              </button>
            </div>
          );
        }
  
        if (!asistencia?.hora_salida && asistencia?.estado === "presente") {
          return (
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded-md"
              onClick={() => registrarSalida(row.asistencia.id)}
            >
              ➡️ Marcar salida
            </button>
          );
        }
        return null;
      },
    },
  ];
  
  

  const elementosFiltrados = infantes.filter((row) =>
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-blue-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              📝 Asistencias
            </h1>
            <p className="text-blue-600">Listado de asistencias registradas</p>
          </div>
          <div className="flex gap-2">
            <ReporteAsistencia />
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
            data={elementosFiltrados}
            progressPending={loading}
            highlightOnHover
            pointerOnHover
            customStyles={estiloTablas}
            paginationComponentOptions={paginationComponentOptions}
            pagination
          />
        </div>
      </div>
    </div>
  );
}
