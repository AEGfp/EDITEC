import { useEffect, useState } from "react";
import { obtenerTodosPermisos } from "../api/permisos.api";
import ListaElementos from "./ListaElementos";

export function ListaPermisos() {
  const [permisos, setPermisos] = useState([]);

  useEffect(() => {
    async function loadPermisos() {
      try {
        const res = await obtenerTodosPermisos();
        console.log(res);

        setPermisos(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadPermisos();
  }, []);
  console.log(permisos);

  return permisos.length > 0 ? (
    <ListaElementos lista={permisos} />
  ) : (
    <p>Cargando permisos...</p>
  );
}
