import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import {
  obtenerNotificaciones,
  eliminarNotificacion,
} from "../api/notificaciones.api";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";

export default function NotificacionesList() {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const puedeEscribir = tienePermiso("notificaciones", "escritura");

  useEffect(() => {
    async function loadNotificaciones() {
      try {
        const res = await obtenerNotificaciones();
        setNotificaciones(res.data);

        const arrayColumnas = [
          {
            name: "Título",
            selector: (fila) => fila.titulo,
            sortable: true,
            wrap: true,
          },
          {
            name: "Mensaje",
            selector: (fila) => fila.mensaje,
            wrap: true,
          },
          {
            name: "Fecha",
            selector: (fila) => {
              const fecha = fila.fecha || "Sin fecha";
              const hora = fila.hora ? fila.hora.slice(0, 5) : "";
              return `${fecha}${hora ? ` ${hora}` : ""}`;
            },
            wrap: true,
          },
          
        ];

        agregarBotonDetalles(arrayColumnas);
        setColumnas(arrayColumnas);
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
      } finally {
        setLoading(false);
      }
    }

    loadNotificaciones();
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
              navigate(`/notificaciones/${fila.id}`);
            }}
          >
            Detalles
          </button>
          {puedeEscribir && (
            <button
              className="boton-eliminar"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(fila.id);
              }}
            >
              Eliminar
            </button>
          )}
        </div>
      ),
    });
  }

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro que deseas eliminar esta notificación?")) {
      await eliminarNotificacion(id);
      const actualizados = notificaciones.filter((n) => n.id !== id);
      setNotificaciones(actualizados);
    }
  };

  const elementosFiltrados = notificaciones.filter((n) =>
    columnas.some((columna) => {
      const valor = columna.selector(n);
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
      <h1 className="align-baseline text-2xl font-semibold p-2 pl-3">Notificaciones</h1>
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
            onClick={() => navigate("/notificaciones-crear")}
          >
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
