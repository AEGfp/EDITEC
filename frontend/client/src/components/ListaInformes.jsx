import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";
import {
  crearReporteInforme,
  obtenerInforme,
  obtenerTodosInformes,
} from "../api/informes.api";
import { obtenerInfantesAsignados } from "../api/asistencias.api";

export function ListaInformes() {
  const navigate = useNavigate();
  const [informes, setInformes] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const puedeEscribir = tienePermiso("informes", "escritura");

  useEffect(() => {
    //Cambiar el nombre de la función
    async function loadInformes() {
      setLoading(true);
      try {
        //Cambiar la API para las demás páginas
        const res = await obtenerTodosInformes();

        console.log(res.data);
        if (res.data.length > 0) {
          const arrayColumnas = definirColumnas();

          agregarBotonDetalles(arrayColumnas);
          setColumnas(arrayColumnas);
          setInformes(res.data);
          setLoading(false);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    //Cambiar el nombre de la función
    loadInformes();
  }, []);

  function definirColumnas() {
    return [
      {
        name: "Infante",
        selector: (row) => row.nombre_infante || "",
        sortable: true,
        wrap: true,
      },
      {
        name: "Tipo Informe",
        selector: (row) => row.descripcion_tipo_informe || "",
        sortable: true,
        wrap: true,
      },
      {
        name: "Fecha Informe",
        selector: (row) => row.fecha_informe,
        sortable: true,
        format: (row) => new Date(row.fecha_informe).toLocaleDateString(),
      },
    ];
  }

  async function handleRowClick(fila) {
    try {
      const res = await crearReporteInforme(fila.id);
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      window.open(url, "_blank");
    } catch (err) {
      console.error("Error al obtener el informe PDF", err);
    }
  }

  function agregarElemento() {
    navigate(`/crear-informe/`);
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
          Ver PDF
        </button>
      ),
    });
  }

  //Cambiar el nombre de 'permiso' según la página
  const elementosFiltrados = informes.filter((informe) =>
    columnas.some((columna) => {
      const elem = columna.selector(informe);
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
      <h1 className="align-baseline text-2xl font-semibold p-2 pl-3">
        Informes
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
