import { useEffect, useState } from "react";
import { obtenerTodosComprobantes } from "../api/comprobante_proveedor.api";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";

export function ListaComprobantesTable() {
  const navigate = useNavigate();
  const [comprobantes, setComprobantes] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const puedeEscribir = tienePermiso("comprobantes", "escritura");

  useEffect(() => {
    async function loadComprobantes() {
      try {
        const res = await obtenerTodosComprobantes();

        if (res.data.length > 0) {
          const columnasDefinidas = [
            {
              name: "Proveedor",
              selector: (fila) => fila.proveedor_nombre,
              sortable: true,
              wrap: true,
              grow: 2,
            },
            {
              name: "Fecha comprobante",
              selector: (fila) => fila.fecha_comprobante,
              sortable: true,
              cell: (fila) => new Date(fila.fecha_comprobante).toLocaleDateString("es-PY"),
            },
            {
              name: "Número",
              selector: (fila) => fila.numero_comprobante,
              sortable: true,
              wrap: true,
            },
            {
              name: "Tipo",
              selector: (fila) => fila.tipo_comprobante_nombre,
              sortable: true,
            },
            {
              name: "Condición",
              selector: (fila) => fila.condicion_nombre,
              sortable: true,
              wrap: true,
              grow: 2,
            },
            {
              name: "Total",
              selector: (fila) => fila.total_comprobante,
              sortable: true,
              right: true,
              cell: (fila) =>
                fila.total_comprobante.toLocaleString("es-PY", {
                  style: "currency",
                  currency: "PYG",
                  minimumFractionDigits: 0,
                }),
            },
          ];

          agregarBotonDetalles(columnasDefinidas);
          setColumnas(columnasDefinidas);
          setComprobantes(res.data);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    loadComprobantes();
  }, []);

  function handleRowClick(fila) {
    navigate(`/comprobantes/${fila.id}`);
  }

  function agregarElemento() {
    navigate(`/crear-comprobante/`);
  }

  function agregarBotonDetalles(arrayColumnas) {
    arrayColumnas.push({
      name: "",
      right: true,
      cell: (fila) => (
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-1 px-3 rounded-lg inline-flex items-center transition duration-200"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(fila);
          }}
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          Detalles
        </button>
      ),
    });
  }

  const elementosFiltrados = comprobantes.filter((comprobante) =>
    columnas.some((columna) => {
      const elem = columna.selector(comprobante);
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
              📄 Comprobantes
            </h1>
            <p className="text-blue-600 text-sm">
              Lista de comprobantes registrados en el sistema
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
              Agregar comprobante
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
              placeholder="Buscar comprobantes..."
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
