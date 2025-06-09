import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";
import {
  marcarPresente,
  marcarAusente,
  obtenerInfantesAsignados,
  marcarSalida,
} from "../api/asistencias.api";

export default function AsistenciasPage() {
  const navigate = useNavigate();
  const [infantes, setInfantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marcando, setMarcando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
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
  }, [marcando]);

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

  const registrarSalida = async (id) => {
    setMarcando(true);
    try {
      const res = await marcarSalida(id);
    } catch (error) {
      console.error("Error al intentar marcar la salida: ", error);
    } finally {
      setMarcando(false);
    }
  };

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
      name: "Hora de entrada",
      selector: (row) => {
        const hora = row.asistencia?.hora_entrada;
        if (!hora) return "--:--";
        const [hh, mm] = hora.split(":");
        return `${hh}:${mm}`;
      },
      sortable: true,
    },
    {
      name: "Hora de salida",
      selector: (row) => {
        const hora = row.asistencia?.hora_salida;
        if (!hora) return "--:--";
        const [hh, mm] = hora.split(":");
        return `${hh}:${mm}`;
      },
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
      name: "Acción",
      cell: (row) => {
        const asistencia = row.asistencia;
        if (!asistencia?.estado) {
          return (
            <div className="flex gap-2">
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
            </div>
          );
        }

        if (!asistencia?.hora_salida) {
          return (
            <button
              className="boton-detalles"
              disabled={marcando}
              onClick={(e) => {
                e.stopPropagation();
                registrarSalida(row.asistencia.id);
              }}
            >
              Marcar salida
            </button>
          );
        }
        return null;
      },
    },
  ];

  const elementosFiltrados = infantes.filter((row) =>
    columnas
      .filter((col) => typeof col.selector === "function") // evita columnas sin selector
      .some((col) => {
        const valor = col.selector(row);
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
      <h1 className="text-2xl font-semibold p-2 pl-3">Infantes de mi Salas</h1>
      <div className="p-2 flex flex-row justify-between">
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className=" border border-gray-300 rounded px-3 py-1 w-full max-w-xs"
        />
      </div>
      <DataTable
        columns={columnas}
        data={elementosFiltrados}
        progressPending={loading}
        highlightOnHover
        pointerOnHover
        //onRowClicked={handleRowClick}
        customStyles={estiloTablas}
        paginationComponentOptions={paginationComponentOptions}
        pagination
      />
    </div>
  );
}
