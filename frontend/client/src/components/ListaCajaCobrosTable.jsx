import { useEffect, useState } from "react";
import { obtenerTodasCajasCobros } from "../api/cobrocuotas.api";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";

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
          // Columnas específicas para CobroCuotaInfante
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
              style: {
                textAlign: 'right',
              },
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
              cell: (fila) => new Date(fila.fecha_cobro).toLocaleDateString('es-ES'),
            },
            {
              name: "Observación",
              selector: (fila) => fila.observacion || '',
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
      style: {
        textAlign: 'right', // Alinea el botón a la derecha
      },
      cell: (fila) => (
        <button
          className="boton-detalles"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(fila);
          }}
        >
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
    <div>
      <h1 className="align-baseline text-2xl font-semibold p-2 pl-3">
        Cobros de Cuotas
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
            Agregar...
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