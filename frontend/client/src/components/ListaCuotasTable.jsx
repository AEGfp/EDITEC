import { useEffect, useState } from "react";
import { obtenerTodasCuotas, 
         obtenerResumenCuotasPorInfante, 
         descargarResumenCuotasPDF,
         descargarResumenTodosLosInfantesPDF } from "../api/saldocuotas.api";
import { obtenerInfantesAsignados } from "../api/asistencias.api";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";

export function ListaCuotasTable() {
  const navigate = useNavigate();
  const [cuotas, setCuotas] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [infantes, setInfantes] = useState([]); ////! lista de infantes asignados
  const [infanteSeleccionado, setInfanteSeleccionado] = useState("");

  const puedeEscribir = tienePermiso("cuotas", "escritura");


  useEffect(() => {
    async function fetchInfantes() {
      try {
        const res = await obtenerInfantesAsignados();
        console.log("Infantes asignados:", res); 
        setInfantes(res.data);
      } catch (error) {
        console.error("Error al cargar infantes", error);
      }
    }
    fetchInfantes();
  }, []);

  useEffect(() => {
    if (!infanteSeleccionado) return;

    async function fetchCuotas() {
      setLoading(true);
      try {
        const res = await obtenerResumenCuotasPorInfante(infanteSeleccionado);
        const data = res.data.resumen;
        if (data.length > 0) {
          const keys = Object.keys(data[0]).filter((key) => key !== "id");

          const columnasDef = keys.map((columna) => ({
            name: columna.charAt(0).toUpperCase() + columna.slice(1),
            selector: (fila) => fila[columna],
            sortable: true,
            cell: (fila) =>
              typeof fila[columna] === "boolean"
                ? fila[columna]
                  ? "Sí"
                  : "No"
                : fila[columna],
          }));

          agregarBotonDetalles(columnasDef);
          setColumnas(columnasDef);
          setCuotas(data);
        } else {
          setCuotas([]);
          setColumnas([]);
        }
      } catch (error) {
        console.error("Error al cargar cuotas", error);
        setCuotas([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCuotas();
  }, [infanteSeleccionado]);

  const generarPDFCuotas = async () => {
  try {
    const res = await descargarResumenCuotasPDF(infanteSeleccionado);
    const archivo = new Blob([res.data], { type: "application/pdf" });
    const url = URL.createObjectURL(archivo);
    window.open(url); // o descargás directamente si preferís
  } catch (error) {
    console.error("Error al generar el PDF de cuotas del infante:", error);
    alert("No se pudo generar el PDF.");
  }
};

  function agregarElemento() {
    navigate(`/crear-cuota/`);
  }

  function handleRowClick(fila) {
    navigate(`/cuotas/${fila.id}`);
  }

  function agregarBotonDetalles(arrayColumnas) {
    arrayColumnas.push({
      name: "",
      selector: (fila) => fila,
      right: true,
      cell: (fila) => (null),
    });
  }

  const elementosFiltrados = cuotas.filter((cuota) =>
    columnas.some((columna) => {
      const elem = columna.selector(cuota);
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
    <div>
      <h1 className="text-2xl font-semibold p-2 pl-3">Cuotas</h1>

      <div className="p-2 flex flex-row flex-wrap gap-4 items-center justify-between">
        <select
          value={infanteSeleccionado}
          onChange={(e) => setInfanteSeleccionado(Number(e.target.value))}
          className="border border-gray-300 rounded px-3 py-1"
        >
          <option value="">Seleccione un infante...</option>
          {infantes.map((i) => (
            <option key={i.infante.id} value={i.infante.id}>
                {i.infante.id_persona.nombre} {i.infante.id_persona.apellido} - {i.infante.nombre_sala}
            </option>
            ))}
        </select>
        
        {infanteSeleccionado && (
        <button
          onClick={generarPDFCuotas}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded"
        >
          Generar Reporte
        </button>
      )}


        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 max-w-xs"
        />
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
  );
}