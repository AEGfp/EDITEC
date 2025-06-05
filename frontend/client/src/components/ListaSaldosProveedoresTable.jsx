import { useEffect, useState } from "react";
import { obtenerTodosSaldos } from "../api/saldo_proveedores.api";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { estiloTablas } from "../assets/estiloTablas";
import tienePermiso from "../utils/tienePermiso";

export function ListaSaldosProveedoresTable() {
  const navigate = useNavigate();
  const [saldos, setSaldos] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const puedeEscribir = tienePermiso("permisos", "escritura");

  useEffect(() => {
    //Cambiar el nombre de la función
    async function loadSaldos() {
      try {
        //Cambiar la API para las demás páginas
        const res = await obtenerTodosSaldos();

 //       setEmpresas(res.data); //!agg
//        setLoading(false); //!agg

        // Mapeo de nombres personalizados
        const nombresColumnas = {
          monto_cuota: "Total Cuota",
          saldo_cuota: "Saldo Cuota",
          fecha_pago: "Fecha de Pago",
          numero_cuota: "N° Cuota",
          numero_comprobante_as: "Comprobante",
          proveedor_nombre: "Proveedor",
          condicion_nombre: "Condición",
        };

        // Lista de claves que querés mostrar
        const camposVisibles = ["monto_cuota", "saldo_cuota", "fecha_pago", "numero_cuota","numero_comprobante_as",
          "proveedor_nombre","condicion_nombre"
        ];


        if (res.data.length > 0) {
            const keys = Object.keys(res.data[0]);

            // Filtrar columnas visibles
            const columnasFiltradas = keys.filter((key) => camposVisibles.includes(key));

            const arrayColumnas = columnasFiltradas.map((columna) => ({
            name: nombresColumnas[columna] || columna,
            selector: (fila) => fila[columna],
            sortable: true,
            cell: (fila) => {
              const valor = fila[columna];

              if (typeof valor === "boolean") {
                return valor ? "Sí" : "No";
              }

              if (typeof valor === "number") {
                return new Intl.NumberFormat("es-ES").format(valor); // Punto como separador de miles
              }

              return valor;
            },
          }));

          


          setColumnas(arrayColumnas);
          //Cambiar el nombre de la función
          setSaldos(res.data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    //Cambiar el nombre de la función
    loadSaldos();
  }, []);

  function handleRowClick(fila) {
    navigate(`/saldos/${fila.id}`);
  }

  function agregarElemento() {
    navigate(`/ver-saldo/`);
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
  const elementosFiltrados = saldos.filter((saldo) =>
    columnas.some((columna) => {
      const elem = columna.selector(saldo);
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
        Saldos de Proveedores
      </h1>
      <div className="p-2 flex flex-row justify-between">
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className=" border border-gray-300 rounded px-3 py-1 w-full max-w-xs"
        />
        {/*puedeEscribir && (
          <button className="boton-guardar items-end" onClick={agregarElemento}>
            Agregar...
          </button>
        )*/}
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
