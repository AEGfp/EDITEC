import { useEffect, useState } from "react";
import { obtenerTodasCajasPagos } from "../api/cajaspagos.api";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";

export function ListaCajasPagosTable() {
  const navigate = useNavigate();
  const [cajas, setCajas] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const puedeEscribir = tienePermiso("cajasPagos", "escritura");

  useEffect(() => {
    //Cambiar el nombre de la función
    async function loadCajas() {
      try {
        //Cambiar la API para las demás páginas
        const res = await obtenerTodasCajasPagos();

 //       setEmpresas(res.data); //!agg
//        setLoading(false); //!agg

        if (res.data.length > 0) {
          const keys = Object.keys(res.data[0]);

          //!!! Desactivar si se quiere mostrar el id
          const columnasFiltradas = keys.filter((key) => key !== "id");

          //Esta lógica puede variar un poco según las columnas que tengan
          // que mostrar
          const arrayColumnas = columnasFiltradas.map((columna) => ({
            name: columna.charAt(0).toUpperCase() + columna.slice(1),
            selector: (fila) => fila[columna],
            sortable: true,
            cell: (fila) =>
              typeof fila[columna] === "boolean"
                ? fila[columna]
                  ? "Sí"
                  : "No"
                : fila[columna],
          }));

          agregarBotonDetalles(arrayColumnas);
          setColumnas(arrayColumnas);
          //Cambiar el nombre de la función
          setCajas(res.data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    //Cambiar el nombre de la función
    loadCajas();
  }, []);

  function handleRowClick(fila) {
    navigate(`/caja-pagos/${fila.id}`);
  }

  function agregarElemento() {
    navigate(`/crear-caja-pago/`);
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
            handleRowClick(fila); // Llama a la función de descarga
          }}
        >
          Detalles
        </button>
      ),
    });
  }

  //Cambiar el nombre de 'permiso' según la página
  const elementosFiltrados = cajas.filter((caja) =>
    columnas.some((columna) => {
      const elem = columna.selector(caja);
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
        Cajas Pagos
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
