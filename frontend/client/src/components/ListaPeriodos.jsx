import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { obtenerPeriodosInscripcion } from "../api/periodos.api";
import { estiloTablas } from "../assets/estiloTablas";
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
      cell: (row) =>
        format(new Date(row.fecha_inicio), "dd/MM/yyyy HH:mm", { locale: es }),
    },
    {
      name: "Fecha de fin",
      selector: (row) => row.fecha_fin,
      sortable: true,
      cell: (row) =>
        format(new Date(row.fecha_fin), "dd/MM/yyyy HH:mm", { locale: es }),
    },
    {
      name: "Activo",
      selector: (row) => row.activo,
      sortable: true,
      cell: (row) => (
        <span
          className={`font-semibold ${
            row.activo ? "text-green-600" : "text-red-600"
          }`}
        >
          {row.activo ? "Sí" : "No"}
        </span>
      ),
    },
    {
      name: "",
      cell: (row) => (
        <button
          className="boton-detalles"
          onClick={() => navigate(`/periodos/${row.id}`)}
        >
          Detalles
        </button>
      ),
      right: true,
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
    <div>
      <h1 className="text-2xl font-semibold p-2 pl-3">
        Periodos de Inscripción
      </h1>

      <div className="p-2 flex flex-row justify-between">
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className=" border border-gray-300 rounded px-3 py-1 w-full max-w-xs"
        />

        <button className="boton-guardar items-end" onClick={agregarElemento}>
          Crear...
        </button>
      </div>

      {errorBackend && <MostrarError errores={errorBackend} />}

      <DataTable
        columns={columnas}
        data={periodosFiltrados}
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
