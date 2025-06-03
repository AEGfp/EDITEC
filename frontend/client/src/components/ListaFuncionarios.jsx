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
    //Cambiar el nombre de la función
    async function loadFuncionarios() {
      try {
        //Cambiar la API para las demás páginas
        const res = await obtenerFuncionarios();

        if (res.data.length > 0) {
          const arrayColumnas = definirColumnas();

          agregarBotonDetalles(arrayColumnas);
          setColumnas(arrayColumnas);
          setFuncionarios(res.data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    //Cambiar el nombre de la función
    loadFuncionarios();
  }, []);

  function handleRowClick(fila) {
    navigate(`/funcionarios/${fila.id}`);
  }

  function agregarElemento() {
    navigate("/funcionarios-crear");
  }

  function definirColumnas() {
    const columnas = [
      {
        name: "Nombre",
        selector: (row) => row.persona.nombre,
        sortable: true,
        cell: (row) =>
          agregarMayuscula(row.persona.nombre) +
          " " +
          agregarMayuscula(row.persona.apellido),
      },
      {
        name: "Usuario",
        selector: (row) => row.username,
        sortable: true,
      },
      {
        name: "Rol/es",
        selector: (row) => row.groups.map(agregarMayuscula).join("/"),
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
    <div>
      <h1 className="align-baseline text-2xl font-semibold p-2 pl-3">
        Funcionarios
      </h1>
      <div className="p-2 flex flex-row justify-between">
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className=" border border-gray-300 rounded px-3 py-1 w-full max-w-xs"
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
      ></DataTable>
    </div>
  );
}
