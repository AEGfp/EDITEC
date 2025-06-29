import { useNavigate } from "react-router-dom";
import { obtenerFuncionarios } from "../api/funcionarios.api";
import { useState, useEffect } from "react";
import tienePermiso from "../utils/tienePermiso";
import DataTable from "react-data-table-component";
import { estiloTablas } from "../assets/estiloTablas";

export default function ListaFuncionarios() {
  const navigate = useNavigate();
  const [funcionarios, setFuncionarios] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const puedeEscribir = tienePermiso("funcionarios", "escritura");

  useEffect(() => {
    async function loadFuncionarios() {
      try {
        const res = await obtenerFuncionarios();

        if (res.data.length > 0) {
          const arrayColumnas = definirColumnas();
          agregarBotonDetalles(arrayColumnas);
          setColumnas(arrayColumnas);
          setFuncionarios(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFuncionarios();
  }, []);

  function handleRowClick(fila) {
    navigate(`/funcionarios/${fila.id}`);
  }

  function agregarElemento() {
    navigate("/funcionarios-crear");
  }

  function definirColumnas() {
    return [
      {
        name: "👤 Nombre",
        selector: (row) => row.persona.nombre,
        sortable: true,
        cell: (row) =>
          `${agregarMayuscula(row.persona.nombre)} ${agregarMayuscula(
            row.persona.apellido
          )}`,
      },
      {
        name: "🧑‍💼 Usuario",
        selector: (row) => row.username,
        sortable: true,
      },
      {
        name: "📌 Rol/es",
        selector: (row) => row.groups.map(agregarMayuscula).join(" / "),
        sortable: true,
      },
    ];
  }

  function agregarBotonDetalles(arrayColumnas) {
    arrayColumnas.push({
      name: "",
      selector: (fila) => fila,
      right: true,
     cell: (fila) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleRowClick(fila);
    }}
    className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 transition-colors"
  >
    <svg
      className="w-4 h-4 mr-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
    Detalles
  </button>
),

    });
  }

  const elementosFiltrados = funcionarios.filter((funcionario) =>
    columnas.some((columna) => {
      const elem = columna.selector(funcionario);
      return elem?.toString().toLowerCase().includes(busqueda.toLowerCase());
    })
  );

  const paginationComponentOptions = {
    rowsPerPageText: "Filas por página",
    rangeSeparatorText: "de",
    selectAllRowsItem: true,
    selectAllRowsItemText: "Todos",
  };

  function agregarMayuscula(palabra) {
    return palabra.charAt(0).toUpperCase() + palabra.slice(1);
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-blue-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A10.978 10.978 0 0112 15c2.21 0 4.253.672 5.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 8a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              Funcionarios
            </h1>
            <p className="text-blue-600">Lista de funcionarios registrados en el sistema</p>
          </div>

          {puedeEscribir && (
            <button
              onClick={agregarElemento}
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Agregar funcionario
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
              placeholder="Buscar funcionarios..."
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
