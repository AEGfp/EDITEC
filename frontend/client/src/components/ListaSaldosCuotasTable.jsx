import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import tienePermiso from "../utils/tienePermiso";
import { estiloTablas } from "../assets/estiloTablas";
import { obtenerSaldosCuotasConFiltros, descargarReporteCuotasPDF} from "../api/saldocuotas.api";
import { obtenerInfantes } from "../api/infantes.api";

export function ListaSaldosCuotasTable() {
  const navigate = useNavigate();

  const [saldos, setSaldos] = useState([]);
  const [infantes, setInfantes] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [infanteId, setInfanteId] = useState("");
  const [estado, setEstado] = useState("");

  const puedeEscribir = tienePermiso("cuotas", "escritura");

  // Cargar infantes para el select
  useEffect(() => {
    async function cargarInfantes() {
      try {
        const res = await obtenerInfantes();
        console.log("Infantes recibidos:", res.data);
        setInfantes(res.data);
      } catch (error) {
        console.error("Error en fetch infantes:", error);
      }
    }
    cargarInfantes();
  }, []);

  // Cargar saldos con filtros
  useEffect(() => {
    async function cargarSaldos() {
      setLoading(true);
      try {
        const filtros = {};
        if (fechaDesde) filtros.fecha_desde = fechaDesde;
        if (fechaHasta) filtros.fecha_hasta = fechaHasta;
        if (infanteId) filtros.infante_id = infanteId;
        if (estado) filtros.estado = estado;

        const res = await obtenerSaldosCuotasConFiltros(filtros);

        if (res.data.length > 0) {
          const nombresColumnas = {
            infante_nombre: "Infante",
            nro_cuota: "N° Cuota",
            fecha_vencimiento: "Fecha Vencimiento",
            dias_atraso: "Días Atraso",
            monto_cuota: "Monto Cuota",
            monto_mora: "Mora",
            estado: "Estado",
            fecha_pago: "Fecha Pago",
          };

          const camposVisibles = [
            "infante_nombre",
            "nro_cuota",
            "fecha_vencimiento",
            "dias_atraso",
            "monto_cuota",
            "monto_mora",
            "estado",
            "fecha_pago",
          ];

          const keys = Object.keys(res.data[0]);
          const columnasFiltradas = keys.filter((k) => camposVisibles.includes(k));

          const columnasDT = columnasFiltradas.map((col) => ({
            name: nombresColumnas[col] || col,
            selector: (row) => row[col],
            sortable: true,
            cell: (row) => {
              const val = row[col];
              if (col === "monto_cuota" || col === "monto_mora") {
                return new Intl.NumberFormat("es-PY").format(val);
              }
              if (col === "fecha_vencimiento" || col === "fecha_pago") {
                return val ? new Date(val).toLocaleDateString("es-PY") : "---";
              }
              return val ?? "---";
            },
          }));

          setColumnas(columnasDT);
        } else {
          setColumnas([]);
        }

        setSaldos(res.data);
      } catch (error) {
        console.error("Error cargando saldos cuotas:", error);
      } finally {
        setLoading(false);
      }
    }

    cargarSaldos();
  }, [fechaDesde, fechaHasta, infanteId, estado]);

  // Filtrado por texto en tabla
  const elementosFiltrados = saldos.filter((saldo) =>
    columnas.some((col) =>
      col.selector(saldo)?.toString().toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  // Generar PDF con filtros
  async function generarPDF() {
    try {
      const filtros = {};
      if (fechaDesde) filtros.fecha_desde = fechaDesde;
      if (fechaHasta) filtros.fecha_hasta = fechaHasta;
      if (infanteId) filtros.infante_id = infanteId;
      if (estado) filtros.estado = estado;

      const res = await descargarReporteCuotasPDF(filtros);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      window.open(url);
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("No se pudo generar el reporte PDF");
    }
  }

  // Navegar a detalle cuota
  function handleRowClick(fila) {
    navigate(`/cuotas/${fila.id}`);
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

    const yyyyMMdd = (d) => d.toISOString().split("T")[0];
    setFechaDesde(yyyyMMdd(primerDia));
    setFechaHasta(yyyyMMdd(ultimoDia));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold p-4">Saldos de Cuotas</h1>

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
          value={infanteId}
          onChange={(e) => setInfanteId(e.target.value ? Number(e.target.value) : "")}
          className="border rounded px-2 py-1"
        >
          <option value="">Todos los Infantes</option>
          {infantes.map((i) => (
            <option key={i.id} value={i.id}>
              {i.id_persona.nombre} {i.id_persona.apellido}
            </option>
          ))}
        </select>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Todos los Estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="PAGADA">Pagada</option>
          <option value="VENCIDA">Vencida</option>
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