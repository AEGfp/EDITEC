import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";
import { obtenerInscripciones } from "../api/inscripciones.api";
import ReporteInscripcionesPage from "../pages/ReporteInscripcionesPage";

export function ListaInscripciones() {
  const navigate = useNavigate();
  const [inscripciones, setInscripciones] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const puedeEscribir = tienePermiso("inscripciones", "escritura");

  useEffect(() => {
    //Cambiar el nombre de la función
    async function loadInscripciones() {
      try {
        //Cambiar la API para las demás páginas
        const res = await obtenerInscripciones();
        console.log(res.data);
        if (res.data.length > 0) {
          const arrayColumnas = definirColumnas();

          agregarBotonDetalles(arrayColumnas);
          setColumnas(arrayColumnas);
          setInscripciones(res.data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    //Cambiar el nombre de la función
    loadInscripciones();
  }, []);

  function handleRowClick(fila) {
    navigate(`/inscripciones/${fila.id}`);
  }

  function definirColumnas() {
    const columnas = [
      {
        name: "Realizada por:",
        selector: (row) => row.nombre_tutor,
        sortable: true,
      },
      {
        name: "Estado",
        selector: (row) => row.estado,
        sortable: true,
        cell: (row) => agregarMayuscula(row.estado),
      },
      {
        name: "Fecha de inscripción",
        selector: (row) => row.fecha_inscripcion,
        sortable: true,
      },
      {
        name: "Fecha de aprobación",
        selector: (row) => row.fecha_revision,
        sortable: true,
      },
      {
        name: "Revisada por:",
        selector: (row) => row.nombre_usuario,
        sortable: true,
      },
    ];

    return columnas;
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
          Detalles
        </button>
      ),
    });
  }

  const elementosFiltrados = inscripciones.filter((inscripcion) =>
    columnas.some((columna) => {
      const elem = columna.selector(inscripcion);
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
    <div>
      <h1 className="align-baseline text-2xl font-semibold p-2 pl-3">
        Inscripciones
      </h1>
      <div className="p-2 flex flex-row justify-between">
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className=" border border-gray-300 rounded px-3 py-1 w-full max-w-xs"
        />
      </div>
      <ReporteInscripcionesPage></ReporteInscripcionesPage>
      <DataTable
        columns={columnas}
        data={elementosFiltrados}
        progressPending={loading}
        pagination
        paginationComponentOptions={paginationComponentOptions}
        highlightOnHover
        customStyles={estiloTablas}
      ></DataTable>
    </div>
  );
}
