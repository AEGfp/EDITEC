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
    //Cambiar el nombre de la función
    async function loadArchivos() {
      try {
        //Cambiar la API para las demás páginas
        const res = id_persona_infante
          ? await obtenerArchivo({ persona: id_persona_infante })
          : await obtenerTodosArchivos();

        if (res.data.length > 0) {
          const keys = Object.keys(res.data[0]);

          const columnasFiltradas = keys.filter((key) => key === "descripcion");

          //Esta lógica puede variar un poco según las columnas que tengan
          // que mostrar
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
                    descargarArchivo(row.id); // Llama a la función de descarga
                  }}
                  className="boton-guardar"
                >
                  Descargar
                </button>
              </div>
            ),
          });

          setColumnas(arrayColumnas);
          //Cambiar el nombre de la función
          setArchivos(res.data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    //Cambiar el nombre de la función
    loadArchivos();
  }, [id_persona_infante]);

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
