import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import tienePermiso from "../utils/tienePermiso";
import { estiloTablas } from "../assets/estiloTablas";
import {
  obtenerSaldosCuotasConFiltros,
  descargarReporteCuotasPDF,
} from "../api/saldocuotas.api";
import { obtenerInfantes } from "../api/infantes.api";
import { FaSearch, FaFilePdf } from "react-icons/fa";

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

  useEffect(() => {
    async function cargarInfantes() {
      try {
        const res = await obtenerInfantes();
        setInfantes(res.data);
      } catch (error) {
        console.error("Error en fetch infantes:", error);
      }
    }
    cargarInfantes();
  }, []);

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

          const camposVisibles = Object.keys(nombresColumnas);
          const columnasDT = camposVisibles.map((col) => ({
            name: nombresColumnas[col],
            selector: (row) => row[col],
            sortable: true,
            cell: (row) => {
              const val = row[col];
              if (col === "monto_cuota" || col === "monto_mora") {
                return `Gs ${Number(val).toLocaleString("es-PY")}`;
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

  function handleRowClick(fila) {
    navigate(`/cuotas/${fila.id}`);
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
    <div className="px-6 pt-4">
      <h1 className="text-2xl font-semibold text-blue-800 flex items-center gap-2">
        💰 Saldos de Cuotas
      </h1>
      <p className="text-sm text-blue-500 mb-3">
        Detalle de cuotas con estado de pago y mora
      </p>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col md:flex-row md:flex-wrap gap-4 mb-4">
        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          className="border border-blue-200 rounded px-2 py-1"
        />
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          className="border border-blue-200 rounded px-2 py-1"
        />
        <select
          value={infanteId}
          onChange={(e) => setInfanteId(e.target.value ? Number(e.target.value) : "")}
          className="border border-blue-200 rounded px-2 py-1"
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
          className="border border-blue-200 rounded px-2 py-1"
        >
          <option value="">Todos los Estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="PAGADA">Pagada</option>
          <option value="VENCIDA">Vencida</option>
        </select>
        <button
          onClick={generarPDF}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
        >
          <FaFilePdf /> Generar PDF
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <div className="relative w-full md:w-1/2">
          <span className="absolute left-3 top-2.5 text-gray-400">
            <FaSearch />
          </span>
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
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
    </div>
  );
}
