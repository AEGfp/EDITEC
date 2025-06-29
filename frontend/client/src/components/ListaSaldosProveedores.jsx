import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import {
  obtenerNotificaciones,
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
            name: "📢 Tipo",
            selector: (fila) => fila.titulo,
            sortable: true,
            wrap: true,
          },
          {
            name: "💬 Mensaje",
            selector: (fila) => fila.contenido,
            wrap: true,
          },
          {
            name: "📅 Fecha",
            selector: (fila) => {
              const fecha = fila.fecha || "Sin fecha";
              const hora = fila.hora ? fila.hora.slice(0, 5) : "";
              return `${fecha}${hora ? ` ${hora}` : ""}`;
            },
            wrap: true,
          },
        ];

        arrayColumnas.push({
          name: "",
          right: true,
          cell: (fila) => (
            <button
              className="inline-flex items-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/notificaciones/${fila.id}`);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Detalles
            </button>
          ),
          
          
          
        });

        setColumnas(arrayColumnas);
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
      } finally {
        setLoading(false);
      }
    }

    loadNotificaciones();
  }, [navigate]);

  const elementosFiltrados = notificaciones.filter((n) =>
    columnas.some((columna) => {
      const valor = columna.selector?.(n);
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
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-blue-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1 4h.01M12 6h.01M12 12c0-1.657-1.343-3-3-3H9a3 3 0 00-3 3v6a3 3 0 003 3h0a3 3 0 003-3v-6z" />
              </svg>
              Notificaciones
            </h1>
            <p className="text-blue-600">Historial de notificaciones del sistema</p>
          </div>

          {puedeEscribir && (
            <button
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors"
              onClick={() => navigate("/notificaciones-crear")}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Agregar notificación
            </button>
          )}
        </div>

        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar notificaciones..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden border border-blue-100">
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
      </div>
    </div>
  );
}
