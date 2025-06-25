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

  // Personaliza los títulos de columnas
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
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];


  // Formatea una fecha tipo "2025-06-24T00:00:00Z" a "24/06/2025"
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
            name: nombresColumnas[columna] || columna.charAt(0).toUpperCase() + columna.slice(1),
            selector: (fila) => {
            const valor = fila[columna];

            // Mostrar nombre del mes si corresponde
            if ((columna === "mes_inicio" || columna === "mes_fin") && typeof valor === "number") {
              return meses[valor] || valor;
            }

            // Si es booleano
            if (typeof valor === "boolean") return valor;

            // Si es un objeto (como 'periodo')
            if (typeof valor === "object" && valor !== null) {
              const inicio = formatearFecha(valor.fecha_inicio);
              const fin = formatearFecha(valor.fecha_fin);
              return `${inicio} - ${fin}`;
            }

            // Si parece fecha
            if (typeof valor === "string" && valor.match(/^\d{4}-\d{2}-\d{2}/)) {
              return formatearFecha(valor);
            }

            return valor;
          },
          cell: (fila) => {
            const valor = fila[columna];

            // Nombre del mes
            if ((columna === "mes_inicio" || columna === "mes_fin") && typeof valor === "number") {
              return meses[valor] || valor;
            }

            if (typeof valor === "boolean") return valor ? "Sí" : "No";

            if (typeof valor === "object" && valor !== null) {
              const inicio = formatearFecha(valor.fecha_inicio);
              const fin = formatearFecha(valor.fecha_fin);
              return `${inicio} - ${fin}`;
            }

            if (typeof valor === "string" && valor.match(/^\d{4}-\d{2}-\d{2}/)) {
              return formatearFecha(valor);
            }

            return valor;
          },

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
          className="boton-detalles"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(fila);
          }}
        >
          Ver
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
    <div>
      <h1 className="align-baseline text-2xl font-semibold p-2 pl-3">
        Parámetros
      </h1>
      <div className="p-2 flex flex-row justify-between">
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 w-full max-w-xs"
        />
        {puedeEscribir && (
          <button className="boton-guardar items-end" onClick={agregarElemento}>
            Crear
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
  );
}
