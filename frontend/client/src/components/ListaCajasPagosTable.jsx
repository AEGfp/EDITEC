import { useEffect, useState } from "react";
import { obtenerTodasCajasPagos } from "../api/cajaspagos.api";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";

export function ListaCajasPagosTable() {
  const navigate = useNavigate();
  const [cajas, setCajas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const puedeEscribir = tienePermiso("cajasPagos", "escritura");

  useEffect(() => {
    async function loadCajas() {
      try {
        const res = await obtenerTodasCajasPagos();
        setCajas(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCajas();
  }, []);

  function handleRowClick(fila) {
    navigate(`/caja-pagos/${fila.id}`);
  }

  function agregarElemento() {
    navigate(`/crear-caja-pago/`);
  }

  const columnas = [
    {
      name: "Pago N°",
      selector: (fila) => fila.id,
      sortable: true,
      width: "100px",
    },
    {
      name: "Fecha de Pago",
      selector: (fila) => fila.fecha_pago,
      sortable: true,
      cell: (fila) =>
        new Date(fila.fecha_pago).toLocaleDateString("es-PY"),
    },
    {
      name: "Proveedor",
      selector: (fila) => fila.proveedor_nombre,
      sortable: true,
      wrap: true,
      grow: 2,
    },
    {
      name: "N° Cuota",
      selector: (fila) => fila.nro_cuota,
      sortable: true,
      center: true,
    },
    {
      name: "Total Pago",
      selector: (fila) => fila.total_pago,
      sortable: true,
      right: true,
      cell: (fila) =>
        fila.total_pago.toLocaleString("es-PY", {
          style: "currency",
          currency: "PYG",
          minimumFractionDigits: 0,
        }),
    },
    {
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
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Detalles
        </button>
      ),
    },
  ];

  const elementosFiltrados = cajas.filter((caja) =>
    columnas.some((columna) => {
      const elem = columna.selector?.(caja);
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
                  d="M17 9V7a4 4 0 00-8 0v2a2 2 0 00-2 2v5a2 2 0 002 2h8a2 2 0 002-2v-5a2 2 0 00-2-2z"
                />
              </svg>
              Cajas de Pago
            </h1>
            <p className="text-blue-600">Listado de cajas utilizadas para pagos</p>
          </div>
          {puedeEscribir && (
            <button
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors"
              onClick={agregarElemento}
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
              Agregar caja
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
                  d="M21 21l-6-6M5 10a7 7 0 1114 0 7 7 0 01-14 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar cajas..."
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
