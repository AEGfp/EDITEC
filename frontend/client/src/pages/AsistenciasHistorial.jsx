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
        console.log(res.data);
        setAsistencias(res.data);
      } catch (error) {
        console.error("Error cargando asistencias:", error);
      } finally {
        setLoading(false);
      }
    }

    cargarAsistencias();
  }, []);

  function handleRowClick(fila) {
    // navigate(`/infantes/${fila.id}`);
    console.log("Click en asistencia", fila);
  }

  const columnas = [
    {
      name: "Fecha",
      selector: (row) => row.fecha,
      format: (row) => row.fecha_formateada || "-",
      sortable: true,
      sortField: "fecha",
    },
    {
      name: "Nombre",
      selector: (row) =>
        `${row.nombre_infante} ${row.apellido_infante || ""}`.trim(),
      sortable: true,
    },
    {
      name: "Estado",
      selector: (row) =>
        row.estado
          ? row.estado.charAt(0).toUpperCase() + row.estado.slice(1)
          : "Sin marcar",
      sortable: true,
    },
    {
      name: "Hora de entrada",
      selector: (row) => row.hora_entrada_formateada || "--:--",
      sortable: true,
    },
    {
      name: "Hora de salida",
      selector: (row) => row.hora_salida_formateada || "--:--",
      sortable: true,
    },
    {
      name: "Registrado por",
      selector: (row) =>
        row.nombre_usuario && row.apellido_usuario
          ? `${row.nombre_usuario} ${row.apellido_usuario}`
          : "N/A",
      sortable: true,
    },
    {
      name: "",
      cell: (row) => (
        <button
          className="boton-detalles"
          onClick={() => navigate(`/asistencias-historial/${row.id}`)}
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
          return valor
            ?.toString()
            .toLowerCase()
            .includes(busqueda.toLowerCase());
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
      <h1 className="text-2xl font-semibold p-2 pl-3">
        Historial de asistencias
      </h1>
      <div className="p-2 flex flex-wrap items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 max-w-xs w-full sm:w-auto"
        />
        <div className="flex flex-wrap gap-2 items-center">
          <label>
            Desde:
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="ml-1 border border-gray-300 rounded px-2 py-1"
            />
          </label>
          <label>
            Hasta:
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="ml-1 border border-gray-300 rounded px-2 py-1"
            />
          </label>
        </div>

        <div className="flex gap-2">
          <ReporteAsistencia />
        </div>
      </div>
      <DataTable
        columns={columnas}
        data={elementosFiltrados}
        progressPending={loading}
        highlightOnHover
        pointerOnHover
        //onRowClicked={handleRowClick}
        customStyles={estiloTablas}
        paginationComponentOptions={paginationComponentOptions}
        pagination
        defaultSortField="fecha"
        defaultSortAsc={true}
      />
    </div>
  );
}
