import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import tienePermiso from "../utils/tienePermiso";
import { estiloTablas } from "../assets/estiloTablas";
import { obtenerSaldosConFiltros, descargarReporteSaldosPDF } from "../api/saldo_proveedores.api";
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

  // Cargar proveedores para el select
  useEffect(() => {
  async function cargarProveedores() {
    try {
      const res = await obtenerTodosProveedores();
      console.log("Proveedores recibidos:", res.data);
      setProveedores(res.data);
    } catch (error) {
      console.error("Error en fetch proveedores:", error);
    }
  }
  cargarProveedores();
}, []);

  // Cargar saldos con filtros
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

          const camposVisibles = [
            "monto_cuota",
            "saldo_cuota",
            "numero_cuota",
            "numero_comprobante_as",
            "proveedor_nombre",
            "condicion_nombre",
          ];

          const keys = Object.keys(res.data[0]);
          const columnasFiltradas = keys.filter((k) => camposVisibles.includes(k));

          const columnasDT = columnasFiltradas.map((col) => ({
            name: nombresColumnas[col] || col,
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

  // Filtrado por texto en tabla
  const elementosFiltrados = saldos.filter((saldo) =>
    columnas.some((col) =>
      col.selector(saldo)?.toString().toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  // Navegar a detalle saldo
  function handleRowClick(fila) {
    navigate(`/saldos/${fila.id}`);
  }

  // Generar PDF con filtros
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

  // Opciones paginación en español
  const paginationComponentOptions = {
    rowsPerPageText: "Filas por página",
    rangeSeparatorText: "de",
    selectAllRowsItem: true,
    selectAllRowsItemText: "Todos",
  };

  // Fecha por defecto: primer día y último día del mes actual
  useEffect(() => {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    const yyyyMMdd = (d) =>
      d.toISOString().split("T")[0]; // formato yyyy-MM-dd para input date

    setFechaDesde(yyyyMMdd(primerDia));
    setFechaHasta(yyyyMMdd(ultimoDia));
  }, []);
  console.log("Proveedores cargados:", proveedores);

  return (
    <div>
      <h1 className="text-2xl font-semibold p-4">Saldos de Proveedores</h1>

      {/* Filtros */}
      <div className="p-4 flex flex-col sm:flex-row gap-4 items-end">
        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          className="border rounded px-2 py-1"
        />

        <select
          value={proveedorId}
          onChange={(e) => setProveedorId(e.target.value ? Number(e.target.value) : "")}
          className="border rounded px-2 py-1"
        >
          <option value="">Todos los Proveedores</option>
          {proveedores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre_fantasia}
            </option>
          ))}
        </select>

        <button
          onClick={generarPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Generar PDF
        </button>
      </div>

      {/* Buscador */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 w-full max-w-xs"
        />
      </div>

      {/* Tabla */}
      <DataTable
        columns={columnas}
        data={elementosFiltrados}
        progressPending={loading}
        pagination
        paginationComponentOptions={paginationComponentOptions}
        highlightOnHover
        customStyles={estiloTablas}
        onRowClicked={handleRowClick}
      />
    </div>
  );
}
