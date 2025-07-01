import { useEffect, useState } from "react";
import { obtenerTodosParametros } from "../api/parametros.api";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";

export function ListaParametrosTable() {
  const navigate = useNavigate();
  const [parametros, setParametros] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const puedeEscribir = tienePermiso("parametros", "escritura");

  const nombresColumnas = {
    periodo: "Periodo",
    mes_inicio: "Mes Inicio",
    mes_fin: "Mes Fin",
    dia_limite_pago: "Día Vencimiento",
    dias_gracia: "Días de Gracia",
    monto_cuota: "Monto de la Cuota",
    mora_por_dia: "Mora por Día",
    estado: "Activo",
    creado_en: "Creado",
    actualizado_en: "Actualizado",
  };

  const meses = [
    "",
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  function formatearFecha(fechaStr) {
    if (!fechaStr) return "—";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-ES");
  }

  useEffect(() => {
    async function loadParametros() {
      try {
        const res = await obtenerTodosParametros();

        if (res.data.length > 0) {
          const keys = Object.keys(res.data[0]);
          const columnasFiltradas = keys.filter((key) => key !== "id");

          const arrayColumnas = columnasFiltradas.map((columna) => ({
            name:
              nombresColumnas[columna] ||
              columna.charAt(0).toUpperCase() + columna.slice(1),
            selector: (fila) => fila[columna],
            cell: (fila) => {
              const valor = fila[columna];

              if ((columna === "mes_inicio" || columna === "mes_fin") && typeof valor === "number") {
                return meses[valor] || valor;
              }

              if (typeof valor === "boolean") return valor ? "Activo" : "Inactivo";

              if (typeof valor === "object" && valor !== null) {
                const inicio = formatearFecha(valor.fecha_inicio);
                const fin = formatearFecha(valor.fecha_fin);
                return `${inicio} - ${fin}`;
              }

              if (typeof valor === "string" && valor.match(/^\d{4}-\d{2}-\d{2}/)) {
                return formatearFecha(valor);
              }

              return valor ?? "";
            },
            sortable: true,
          }));

          agregarBotonDetalles(arrayColumnas);
          setColumnas(arrayColumnas);
          setParametros(res.data);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }

    loadParametros();
  }, []);

  function handleRowClick(fila) {
    navigate(`/parametros/${fila.id}`);
  }

  function agregarElemento() {
    navigate(`/crear-parametro/`);
  }

  function agregarBotonDetalles(arrayColumnas) {
    arrayColumnas.push({
      name: "",
      selector: (fila) => fila,
      right: true,
      cell: (fila) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(fila);
          }}
          className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 transition-colors"
        >
          Detalles
        </button>
      ),
    });
  }

  const elementosFiltrados = parametros.filter((parametro) =>
    columnas.some((columna) => {
      const elem = columna.selector(parametro);
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
              <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
              </svg>
              Parámetros
            </h1>
            <p className="text-blue-600">Configuraciones de parámetros del sistema</p>
          </div>

          {puedeEscribir && (
            <button
              onClick={agregarElemento}
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Crear parámetro
            </button>
          )}
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
              placeholder="Buscar parámetros..."
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
