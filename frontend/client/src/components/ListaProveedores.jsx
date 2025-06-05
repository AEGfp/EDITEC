import { useEffect, useState } from "react";
import { obtenerTodosProveedores } from "../api/proveedores.api";
import ListaElementos from "./ListaElementos";

export function ListaProveedores() {
  const [proveedores, setProveedores] = useState([]);

  useEffect(() => {
    async function loadProveedores() {
      try {
        const res = await obtenerTodosProveedores();
        console.log(res);

        setProveedores(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadProveedores();
  }, []);
  console.log(proveedores);

  return proveedores.length > 0 ? (
    <ListaElementos lista={proveedores} />
  ) : (
    <p>Aún no se registraron proveedores</p>
  );
}
