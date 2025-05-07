import { useEffect, useState } from "react";
import { obtenerTodosArchivos } from "../api/archivos.api";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { estiloTablas } from "../assets/estiloTablas";

export default function ConsultarArchivos() {
  const navigate = useNavigate();
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    //Cambiar el nombre de la función
    async function loadArchivos() {
      try {
        //Cambiar la API para las demás páginas
        const res = await obtenerTodosArchivos();
        if (res.data.length > 0) {
          const keys = Object.keys(res.data[0]);

          //!!! Desactivar si se quiere mostrar el id
          const columnasFiltradas = res.data.map((archivo) => ({
            descripcion: archivo.descripcion,
          }));

          // setColumnas(columnasFiltradas);
          //Cambiar el nombre de la función
          setArchivos(columnasFiltradas);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    //Cambiar el nombre de la función
    loadArchivos();
  }, []);
  /*
  function handleRowClick(fila) {
    navigate(`/archivos/${fila.id}`);
  }
*/

  const columnas = [
    {
      name: "Descripción",
      selector: (row) => row.descripcion,
      sortable: true,
    },
  ];
  //Cambiar el nombre de 'Archivo' según la página
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
    <div>
      {/*Cambiar el nombre de la página
      y de data={--nombre---} según la página*/}
      <h1 className="text-2xl font-semibold p-2 pl-3">Archivos</h1>

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
        highlightOnHover
        customStyles={estiloTablas}
      ></DataTable>
    </div>
  );
}
