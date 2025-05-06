import { useEffect, useState } from "react";
import { obtenerTodosPermisos } from "../api/permisos.api";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { estiloTablas } from "../assets/estiloTablas";

export function ListaPermisosTable() {
  const navigate = useNavigate();
  const [permisos, setPermisos] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    //Cambiar el nombre de la función
    async function loadPermisos() {
      try {
        //Cambiar la API para las demás páginas
        const res = await obtenerTodosPermisos();

        if (res.data.length > 0) {
          const keys = Object.keys(res.data[0]);

          //!!! Desactivar si se quiere mostrar el id
          const columnasFiltradas = keys.filter((key) => key !== "id");

          //Esta lógica puede variar un poco según las columnas que tengan
          // que mostrar
          const arrayColumnas = columnasFiltradas.map((columna) => ({
            name: columna.charAt(0).toUpperCase() + columna.slice(1),
            selector: (row) => row[columna],
            sortable: true,
            cell: (row) =>
              typeof row[columna] === "boolean"
                ? row[columna]
                  ? "Sí"
                  : "No"
                : row[columna],
          }));

          setColumnas(arrayColumnas);
          //Cambiar el nombre de la función
          setPermisos(res.data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    //Cambiar el nombre de la función
    loadPermisos();
  }, []);

  function handleRowClick(fila) {
    navigate(`/permisos/${fila.id}`);
  }

  //Cambiar el nombre de 'permiso' según la página
  const elementosFiltrados = permisos.filter((permiso) =>
    columnas.some((columna) => {
      const elem = columna.selector(permiso);
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
    <div>
      {/*Cambiar el nombre de la página
      y de data={--nombre---} según la página*/}
      <h1 className="text-2xl font-semibold p-2 pl-3">Permisos</h1>

      <div className="p-2">
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 w-full max-w-xs"
        />
      </div>
      <DataTable
        columns={columnas}
        data={elementosFiltrados}
        progressPending={loading}
        pagination
        paginationComponentOptions={paginationComponentOptions}
        onRowClicked={handleRowClick}
        highlightOnHover
        customStyles={estiloTablas}
      ></DataTable>
    </div>
  );
}
