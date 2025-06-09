import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";
import { obtenerInfantesAsignados } from "../api/salas.api";
import { marcarPresente, marcarAusente } from "../api/asistencias.api";

export default function AsistenciasPage() {
  const navigate = useNavigate();
  const [infantes, setInfantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marcando, setMarcando] = useState(false);

  useEffect(() => {
    async function cargarInfantes() {
      try {
        const res = await obtenerInfantesAsignados();
        console.log(res.data);
        setInfantes(res.data);
      } catch (error) {
        console.error("Error cargando infantes:", error);
      } finally {
        setLoading(false);
      }
    }

    cargarInfantes();
  }, []);

  const marcarAsistencia = async (id, estado) => {
    setMarcando(true);
    try {
      if (estado === "presente") await marcarPresente(id);
      else await marcarAusente(id);
    } catch (error) {
      console.error(error);
    } finally {
      setMarcando(false);
    }
  };

  function handleRowClick(fila) {
    // navigate(`/infantes/${fila.id}`);
    console.log("Click en infante", fila);
  }

  const columnas = [
    {
      name: "Nombre",
      selector: (row) =>
        row.infante.id_persona
          ? `${row.infante.id_persona.nombre} ${
              row.infante.id_persona.apellido
            } ${row.infante.id_persona.segundo_apellido || ""}`.trim()
          : "Desconocido",
      sortable: true,
    },
    {
      name: "Sala",
      selector: (row) => row.infante.nombre_sala || "Sin sala",
      sortable: true,
    },
    {
      name: "Asistencia",
      selector: (row) =>
        row.asistencia?.estado
          ? row.asistencia.estado.charAt(0).toUpperCase() +
            row.asistencia.estado.slice(1)
          : "Sin marcar",
      sortable: true,
    },
    {
      name: "Usuario Auditor",
      selector: (row) =>
        row.asistencia?.nombre_usuario && row.asistencia?.apellido_usuario
          ? `${row.asistencia.nombre_usuario} ${row.asistencia.apellido_usuario}`
          : "N/A",
      sortable: true,
    },
    {
      name: "",
      right: true,
      cell: (row) => (
        <button
          className="boton-guardar"
          disabled={marcando}
          onClick={(e) => {
            e.stopPropagation();
            marcarAsistencia(row.infante.id, "presente");
          }}
        >
          ✓
        </button>
      ),
    },
    {
      name: "",
      cell: (row) => (
        <button
          className="boton-eliminar"
          disabled={marcando}
          onClick={(e) => {
            e.stopPropagation();
            marcarAsistencia(row.infante.id, "ausente");
          }}
        >
          X
        </button>
      ),
    },
  ];
  return (
    <div>
      <h1 className="text-2xl font-semibold p-2 pl-3">Infantes de mi Salas</h1>
      <DataTable
        columns={columnas}
        data={infantes}
        progressPending={loading}
        highlightOnHover
        pointerOnHover
        //onRowClicked={handleRowClick}
        customStyles={estiloTablas}
        pagination
      />
    </div>
  );
}
