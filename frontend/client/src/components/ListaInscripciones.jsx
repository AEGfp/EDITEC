import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";
import {
  eliminarInscripcion,
  limpiarInscripciones,
  obtenerInscripcionesActuales,
} from "../api/inscripciones.api";
import ReporteInscripcionesPage from "../pages/ReporteInscripcionesPage";

export default function ListaInscripciones({ periodo }) {
  const navigate = useNavigate();
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const puedeEscribir = tienePermiso("inscripciones", "escritura");

  useEffect(() => {
    async function cargarInscripciones() {
      if (!periodo || !periodo.id) {
        setInscripciones([]);
        return;
      }

      setLoading(true);
      try {
        const res = await obtenerInscripcionesActuales(periodo.id);
        setInscripciones(res.data);
      } catch (error) {
        console.error("Error cargando inscripciones:", error);
        setInscripciones([]);
      } finally {
        setLoading(false);
      }
    }

    cargarInscripciones();
  }, [periodo]);

  const columnas = [
    {
      name: "📋 Realizada por",
      selector: (row) => row.nombre_tutor,
      sortable: true,
    },
    {
      name: "📌 Estado",
      selector: (row) => row.estado,
      sortable: true,
      cell: (row) => agregarMayuscula(row.estado),
    },
    {
      name: "🗓️ Fecha de inscripción",
      selector: (row) => row.fecha_inscripcion,
      sortable: true,
    },
    {
      name: "✅ Fecha de aprobación",
      selector: (row) => row.fecha_revision,
      sortable: true,
    },
    {
      name: "👤 Revisada por",
      selector: (row) => row.nombre_usuario,
      sortable: true,
    },
    {
      name: "👁️ Ver",
      cell: (row) => (
        <button
          className="flex items-center gap-1 text-white bg-blue-500 hover:bg-blue-600 text-sm px-3 py-1 rounded-full shadow"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/inscripciones/${row.id}`);
          }}
        >
          Detalles
        </button>
      ),
      right: true,
    },
  ];

  const inscripcionesFiltradas = inscripciones.filter((inscripcion) =>
    columnas.some((col) => {
      const valor = col.selector ? col.selector(inscripcion) : null;
      return valor?.toString().toLowerCase().includes(busqueda.toLowerCase());
    })
  );

  function agregarMayuscula(text = "") {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  async function manejarEliminar() {
    try {
      const res = await limpiarInscripciones();
      console.log("Inscripciones eliminadas");
      navigate("/inscripciones/");
    } catch (error) {
      console.log("Error al intentar eliminar las inscripciones", error);
    }
  }

  return (
    <div className="p-4 bg-blue-50 rounded-md shadow">
      <h1 className="text-2xl font-semibold text-blue-800 flex items-center gap-2 mb-1">
        📝 Inscripciones
      </h1>
      <p className="text-sm text-blue-600 mb-4">Revisa y gestiona las inscripciones</p>

      <div className="p-2 flex flex-wrap items-center justify-between gap-4">
        <input
          type="text"
          placeholder="🔍 Buscar inscripciones..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-blue-200 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm w-full sm:w-auto"
        />

        <div className="flex gap-2">
          <ReporteInscripcionesPage />
        </div>
      </div>

      <DataTable
        columns={columnas}
        data={inscripcionesFiltradas}
        progressPending={loading}
        pagination
        paginationComponentOptions={{
          rowsPerPageText: "Filas por página",
          rangeSeparatorText: "de",
          selectAllRowsItem: true,
          selectAllRowsItemText: "Todos",
        }}
        highlightOnHover
        customStyles={estiloTablas}
      />
    </div>
  );
}
