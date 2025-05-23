import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { obtenerInscripciones, eliminarInscripcion } from "../api/inscripciones.api";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";

export default function InscripcionesList() {
  const navigate = useNavigate();
  const [inscripciones, setInscripciones] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const puedeEscribir = tienePermiso("inscripciones", "escritura");

  useEffect(() => {
    async function loadInscripciones() {
      try {
        const res = await obtenerInscripciones();
        setInscripciones(res.data);

        const columnasBase = [
          {
            name: "Infante",
            selector: (fila) =>
              fila.id_infante?.id_persona
                ? `${fila.id_infante.id_persona.nombre} ${fila.id_infante.id_persona.apellido}`
                : "Desconocido",
            sortable: true,
            wrap: true,
          },
          {
            name: "Tutor",
            selector: (fila) =>
              fila.id_tutor?.id_persona
                ? `${fila.id_tutor.id_persona.nombre} ${fila.id_tutor.id_persona.apellido}`
                : "Desconocido",
            wrap: true,
          },
          {
            name: "Estado",
            selector: (fila) => fila.estado || "Pendiente",
            wrap: true,
          },
        ];

        agregarBotonDetalles(columnasBase);
        setColumnas(columnasBase);
      } catch (error) {
        console.error("Error al cargar inscripciones:", error);
      } finally {
        setLoading(false);
      }
    }

    loadInscripciones();
  }, []);

  function agregarBotonDetalles(arrayColumnas) {
    arrayColumnas.push({
      name: "",
      selector: (fila) => fila,
      right: true,
      cell: (fila) => (
        <div className="flex gap-2">
          <button
            className="boton-detalles"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/inscripciones/${fila.id}`);
            }}
          >
            Detalles
          </button>
        </div>
      ),
    });
  }

  const elementosFiltrados = inscripciones.filter((inscripcion) =>
    columnas.some((columna) => {
      const valor = columna.selector(inscripcion);
      return valor?.toString().toLowerCase().includes(busqueda.toLowerCase());
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
      <h1 className="align-baseline text-2xl font-semibold p-2 pl-3">Inscripciones</h1>
      <div className="p-2 flex flex-row justify-between">
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 w-full max-w-xs"
        />
        {puedeEscribir && (
          <button
            className="boton-guardar items-end"
            onClick={() => navigate("/inscripciones-crear")}
          >
            Añadir...
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
