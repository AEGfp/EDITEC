import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { obtenerTutores, eliminarTutor } from "../api/tutores.api";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";

export default function TutoresList() {
  const navigate = useNavigate();
  const [tutores, setTutores] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const puedeEscribir = tienePermiso("tutores", "escritura");

  useEffect(() => {
    async function loadTutores() {
      try {
        const resTutores = await obtenerTutores();
        setTutores(resTutores.data);

        const arrayColumnas = [
          {
            name: "Nombre",
            selector: (fila) =>
              fila.id_persona?.nombre && fila.id_persona?.apellido
                ? `${fila.id_persona.nombre} ${fila.id_persona.apellido}`
                : "Desconocido",
            sortable: true,
            cell: (fila) =>
              fila.id_persona?.nombre && fila.id_persona?.apellido
                ? `${fila.id_persona.nombre} ${fila.id_persona.apellido}`
                : "Desconocido",
            wrap: true,
          },
        ];

        agregarBotonDetalles(arrayColumnas);
        setColumnas(arrayColumnas);
      } catch (error) {
        console.error("Error al cargar tutores:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTutores();
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
              navigate(`/tutores/${fila.id}`);
            }}
          >
            Detalles
          </button>
        </div>
      ),
    });
  }

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro que deseas eliminar este tutor?")) {
      await eliminarTutor(id);
      const actualizados = tutores.filter((t) => t.id !== id);
      setTutores(actualizados);
    }
  };

  const elementosFiltrados = tutores.filter((tutor) =>
    columnas.some((columna) => {
      const valor = columna.selector(tutor);
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
      <h1 className="align-baseline text-2xl font-semibold p-2 pl-3">
        Tutores
      </h1>
      <div className="p-2 flex flex-row justify-between">
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 w-full max-w-xs"
        />
        {/*puedeEscribir && (
          <button
            className="boton-guardar items-end"
            onClick={() => navigate("/tutores-crear")}
          >
            Agregar...
          </button>
        )*/}
      </div>

      <DataTable
        columns={columnas}
        data={elementosFiltrados}
        progressPending={loading}
        pagination
        paginationComponentOptions={paginationComponentOptions}
        highlightOnHover
        customStyles={estiloTablas}
        conditionalRowStyles={[
          {
            when: (row) => row.es_propio === true,
            style: {
              backgroundColor: "#EFF6FF",
              color: "#1E40AF",
              fontWeight: "600",
            },
          },
        ]}
      />
    </div>
  );
}
