import { useEffect, useState } from "react";
import {
  descargarArchivo,
  obtenerTodosArchivos,
  obtenerArchivo,
} from "../api/archivos.api";
import DataTable from "react-data-table-component";
import { useNavigate, useParams } from "react-router-dom";
import { estiloTablas } from "../assets/estiloTablas";

export default function ConsultarArchivos({ id_persona_infante }) {
  const navigate = useNavigate();
  const [archivos, setArchivos] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    async function loadArchivos() {
      try {
        const res = id_persona_infante
          ? await obtenerArchivo({ persona: id_persona_infante })
          : await obtenerTodosArchivos();

        if (res.data.length > 0) {
          const keys = Object.keys(res.data[0]);
          const columnasFiltradas = keys.filter((key) => key === "descripcion");

          const arrayColumnas = columnasFiltradas.map((columna) => ({
            name: columna.charAt(0).toUpperCase() + columna.slice(1),
            selector: (row) => row[columna],
            sortable: true,
            cell: (row) => row[columna],
          }));

          arrayColumnas.push({
            name: "",
            selector: (row) => row.id,
            right: true,
            cell: (row) => (
              <div className="">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    descargarArchivo(row.id);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Descargar
                </button>
              </div>
            ),
          });

          setColumnas(arrayColumnas);
          setArchivos(res.data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    loadArchivos();
  }, [id_persona_infante]);

  const elementosFiltrados = archivos.filter((archivo) =>
    columnas.some((columna) => {
      const elem = columna.selector(archivo);
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
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado con el mismo estilo */}
        <div className="bg-blue-100 rounded-lg px-6 py-4 mb-8">
          <h1 className="text-2xl font-bold text-blue-800 flex items-center gap-3">
            <span className="text-3xl">📁</span>
            ARCHIVOS ADJUNTOS
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Barra de búsqueda con estilo mejorado */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar archivos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Tabla con estilos personalizados */}
          <DataTable
            columns={columnas}
            data={elementosFiltrados}
            progressPending={loading}
            pagination
            paginationComponentOptions={paginationComponentOptions}
            highlightOnHover
            customStyles={{
              ...estiloTablas,
              headCells: {
                style: {
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  backgroundColor: '#f0f9ff', // Fondo azul claro
                  color: '#1e40af', // Texto azul oscuro
                },
              },
              cells: {
                style: {
                  fontSize: '1rem',
                  padding: '1rem',
                },
              },
            }}
            noDataComponent={
              <div className="p-4 text-center text-lg text-gray-500">
                No se encontraron archivos
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}