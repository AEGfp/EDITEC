import { useEffect, useState } from "react";
import { obtenerTodosProveedores } from "../api/proveedores.api";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";

export function ListaProveedoresTable() {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const puedeEscribir = tienePermiso("proveedores", "escritura");

  useEffect(() => {
    async function loadProveedores() {
      try {
        const res = await obtenerTodosProveedores();

        if (res.data.length > 0) {
          const columnasDefinidas = [
            {
              name: "Nombre",
              selector: (fila) => fila.nombre_fantasia,
              sortable: true,
            },
            {
              name: "RUC",
              selector: (fila) => fila.ruc,
              sortable: true,
            },
            {
              name: "Teléfono",
              selector: (fila) => fila.telefono,
              sortable: true,
            },
            {
              name: "Observaciones",
              selector: (fila) => fila.observaciones,
              sortable: false,
              wrap: true,
              grow: 2,
            },
            {
              name: "Estado",
              selector: (fila) => fila.estado,
              sortable: true,
              cell: (fila) => (
                <span className={fila.estado ? "text-green-600" : "text-red-600"}>
                  {fila.estado ? "Activo" : "Inactivo"}
                </span>
              ),
            },
          ];

          agregarBotonDetalles(columnasDefinidas);
          setColumnas(columnasDefinidas);
          setProveedores(res.data);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    loadProveedores();
  }, []);

  function handleRowClick(fila) {
    navigate(`/proveedores/${fila.id}`);
  }

  function agregarElemento() {
    navigate(`/crear-proveedor/`);
  }

  function agregarBotonDetalles(arrayColumnas) {
    arrayColumnas.push({
      name: "",
      right: true,
      cell: (fila) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(fila);
          }}
          className="inline-flex items-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition"
        >
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Detalles
        </button>
      ),
    });
  }

  const elementosFiltrados = proveedores.filter((proveedor) =>
    columnas.some((columna) => {
      const elem = columna.selector(proveedor);
      return elem?.toString().toLowerCase().includes(busqueda.toLowerCase());
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
              📦 Proveedores
            </h1>
            <p className="text-blue-600 text-sm">
              Lista de proveedores registrados en el sistema
            </p>
          </div>
          {puedeEscribir && (
            <button
              onClick={agregarElemento}
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Agregar proveedor
            </button>
          )}
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar proveedores..."
              className="block w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 border border-blue-100">
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
      </div>
    </div>
  );
}
