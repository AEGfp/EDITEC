import { useEffect, useState } from "react";
import { obtenerTodasEmpresas } from "../api/empresas.api";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";

export function ListaEmpresasTable() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const puedeEscribir = tienePermiso("empresas", "escritura");

  useEffect(() => {
    async function loadEmpresas() {
      try {
        const res = await obtenerTodasEmpresas();
        if (res.data.length > 0) {
          const columnasDefinidas = [
            {
              name: "Nombre",
              selector: (fila) => fila.descripcion,
              sortable: true,
            },
            {
              name: "Dirección",
              selector: (fila) => fila.direccion,
              sortable: true,
            },
            {
              name: "Teléfono",
              selector: (fila) => fila.telefono,
              sortable: true,
            },
            {
              name: "RUC",
              selector: (fila) => fila.ruc,
              sortable: true,
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
          setEmpresas(res.data);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }

    loadEmpresas();
  }, []);

  function handleRowClick(fila) {
    navigate(`/empresas/${fila.id}`);
  }

  function agregarElemento() {
    navigate(`/crear-empresa/`);
  }

  function agregarBotonDetalles(arrayColumnas) {
    arrayColumnas.push({
      name: "",
      selector: (fila) => fila,
      right: true,
      cell: (fila) => (
        <button
          className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 transition-colors"
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

  const elementosFiltrados = empresas.filter((empresa) =>
    columnas.some((columna) => {
      const elem = columna.selector(empresa);
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-blue-800 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h2l1 2h13l1-2h2M5 6h14l1 2H4l1-2zm2 8h10v2H7v-2z"
                />
              </svg>
              Empresas
            </h1>
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
              Agregar empresa
            </button>
          )}
        </div>

        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
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
              placeholder="Buscar empresas..."
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
            paginationComponentOptions={paginationComponentOptions}
            highlightOnHover
            customStyles={estiloTablas}
          />
        </div>
      </div>
    </div>
  );
}
