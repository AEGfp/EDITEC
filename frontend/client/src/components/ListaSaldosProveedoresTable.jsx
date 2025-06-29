import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import tienePermiso from "../utils/tienePermiso";
import { estiloTablas } from "../assets/estiloTablas";
import { obtenerSaldosConFiltros, descargarReporteSaldosPDF, descargarReporteIvaPDF} from "../api/saldo_proveedores.api";
import { obtenerTodosProveedores } from "../api/proveedores.api";

export function ListaSaldosProveedoresTable() {
  const navigate = useNavigate();

  const [saldos, setSaldos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [proveedorId, setProveedorId] = useState("");

  const puedeEscribir = tienePermiso("saldos", "escritura");

  useEffect(() => {
    async function cargarProveedores() {
      try {
        const res = await obtenerTodosProveedores();
        setProveedores(res.data);
      } catch (error) {
        console.error("Error en fetch proveedores:", error);
      }
    }
    cargarProveedores();
  }, []);

  useEffect(() => {
    async function cargarSaldos() {
      setLoading(true);
      try {
        const filtros = {};
        if (fechaDesde) filtros.fecha_desde = fechaDesde;
        if (fechaHasta) filtros.fecha_hasta = fechaHasta;
        if (proveedorId) filtros.proveedor_id = proveedorId;

        const res = await obtenerSaldosConFiltros(filtros);

        if (res.data.length > 0) {
          const nombresColumnas = {
            monto_cuota: "Total Cuota",
            saldo_cuota: "Saldo Cuota",
            numero_cuota: "N° Cuota",
            numero_comprobante_as: "Comprobante",
            proveedor_nombre: "Proveedor",
            condicion_nombre: "Condición",
          };

          const camposVisibles = Object.keys(nombresColumnas);
          const columnasDT = camposVisibles.map((col) => ({
            name: nombresColumnas[col],
            selector: (row) => row[col],
            sortable: true,
            cell: (row) => {
              const val = row[col];
              if (typeof val === "boolean") return val ? "Sí" : "No";
              if (typeof val === "number") return new Intl.NumberFormat("es-ES").format(val);
              return val ?? "";
            },
          }));
          setColumnas(columnasDT);
        } else {
          setColumnas([]);
        }

        setSaldos(res.data);
      } catch (error) {
        console.error("Error cargando saldos", error);
      } finally {
        setLoading(false);
      }
    }

    cargarSaldos();
  }, [fechaDesde, fechaHasta, proveedorId]);

  const elementosFiltrados = saldos.filter((saldo) =>
    columnas.some((col) =>
      col.selector(saldo)?.toString().toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  async function generarPDF() {
    try {
      const filtros = {};
      if (fechaDesde) filtros.fecha_desde = fechaDesde;
      if (fechaHasta) filtros.fecha_hasta = fechaHasta;
      if (proveedorId) filtros.proveedor_id = proveedorId;

      const res = await descargarReporteSaldosPDF(filtros);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      window.open(url);
    } catch (error) {
      console.error("Error generando PDF", error);
      alert("No se pudo generar el reporte PDF");
    }
  }

  // Generar PDF con filtros
  async function generarIvaPDF() {
    try {
      const filtros = {};
      if (fechaDesde) filtros.fecha_desde = fechaDesde;
      if (fechaHasta) filtros.fecha_hasta = fechaHasta;
      if (proveedorId) filtros.proveedor_id = proveedorId;

      const res = await descargarReporteIvaPDF(filtros);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      window.open(url);
    } catch (error) {
      console.error("Error generando PDF", error);
      alert("No se pudo generar el reporte PDF");
    }
  }

  const paginationComponentOptions = {
    rowsPerPageText: "Filas por página",
    rangeSeparatorText: "de",
    selectAllRowsItem: true,
    selectAllRowsItemText: "Todos",
  };

  useEffect(() => {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    const yyyyMMdd = (d) => d.toISOString().split("T")[0];

    setFechaDesde(yyyyMMdd(primerDia));
    setFechaHasta(yyyyMMdd(ultimoDia));
  }, []);

    return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-blue-800 flex items-center">
              📊 Saldos de Proveedores
            </h1>
            <p className="text-blue-600 text-sm">
              Consulta de saldos pendientes según fecha y proveedor
            </p>
          </div>
          {puedeEscribir && (
            <button
              onClick={generarPDF}
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Reporte Saldos
            </button> 
          )}
          {puedeEscribir && (
            <button
              onClick={generarIvaPDF}
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Reporte IVA
            </button> 
          )}
        </div>

        {/* Filtros */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm flex flex-wrap gap-4">
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="border border-blue-200 rounded-lg px-3 py-2 bg-blue-50"
          />
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="border border-blue-200 rounded-lg px-3 py-2 bg-blue-50"
          />
          <select
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value ? Number(e.target.value) : "")}
            className="border border-blue-200 rounded-lg px-3 py-2 bg-blue-50"
          >
            <option value="">Todos los Proveedores</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre_fantasia}
              </option>
            ))}
          </select>
        </div>

        {/* Buscador */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6M5 10a7 7 0 1114 0 7 7 0 01-14 0z"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar saldos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white shadow rounded-lg overflow-hidden border border-blue-100">
          <DataTable
            columns={columnas}
            data={elementosFiltrados}
            progressPending={loading}
            pagination
            paginationComponentOptions={paginationComponentOptions}
            highlightOnHover
            customStyles={estiloTablas}
            onRowClicked={(row) => navigate(`/saldos/${row.id}`)}
          />
        </div>
      </div>
    </div>
  );
}
