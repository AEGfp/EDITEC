import { useEffect, useState } from "react";
import { obtenerTodasCajasCobros } from "../api/cobrocuotas.api";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";
import { FaSearch, FaPlus } from "react-icons/fa";

export function ListaCajaCobrosTable() {
  const navigate = useNavigate();
  const [cajas, setCajas] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const puedeEscribir = tienePermiso("cajasCobros", "escritura");

  useEffect(() => {
    async function loadCajas() {
      try {
        const res = await obtenerTodasCajasCobros();
        if (res.data.length > 0) {
          const columnasDefinidas = [
            {
              name: "Cuota ID",
              selector: (fila) => fila.cuota_id,
              sortable: true,
            },
            {
              name: "Monto Cobrado",
              selector: (fila) => fila.monto_cobrado,
              sortable: true,
              style: { textAlign: "right" },
              cell: (fila) => `Gs ${fila.monto_cobrado.toLocaleString()}`,
            },
            {
              name: "Método de Pago",
              selector: (fila) => fila.metodo_pago,
              sortable: true,
            },
            {
              name: "Fecha Cobro",
              selector: (fila) => fila.fecha_cobro,
              sortable: true,
              cell: (fila) =>
                new Date(fila.fecha_cobro).toLocaleDateString("es-ES"),
            },
            {
              name: "Observación",
              selector: (fila) => fila.observacion || "",
              sortable: true,
            },
          ];
          agregarBotonDetalles(columnasDefinidas);
          setColumnas(columnasDefinidas);
          setCajas(res.data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar cobros:", err);
        setLoading(false);
      }
    }
    loadCajas();
  }, []);

  function handleRowClick(fila) {
    navigate(`/cobros-cuotas/crear/${fila.id}`);
  }

  function agregarElemento() {
    navigate(`/cobros-cuotas/crear/`);
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
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 3.5c-5.05 0-8 5.25-8 6.5s2.95 6.5 8 6.5 8-5.25 8-6.5-2.95-6.5-8-6.5zm0 11a4.5 4.5 0 110-9 4.5 4.5 0 010 9zm0-7a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"/>
          </svg>
          Detalles
        </button>
      ),
    });
  }
  
  const elementosFiltrados = cajas.filter((caja) =>
    columnas.some((columna) => {
      const elem = columna.selector(caja);
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
    <div className="px-6 pt-4">
      <h1 className="text-2xl font-semibold text-blue-800 flex items-center gap-2">
        📋 Cobros de Cuotas
      </h1>
      <p className="text-sm text-blue-500 mb-3">
        Lista de cobros registrados en el sistema
      </p>

      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
          <div className="relative w-full md:w-1/2">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Buscar cobros..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          {puedeEscribir && (
            <button
            className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 transition-colors"
            onClick={agregarElemento}
          >
            <FaPlus className="mr-1" /> Agregar cobro
          </button>
          
          )}
        </div>

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
  );
}
