import { useEffect, useState } from "react";
import { obtenerTodosParametros } from "../api/parametros.api";
import ListaElementos from "./ListaElementos";

export function ListaParametros() {
  const [parametros, setParametros] = useState([]);

  useEffect(() => {
    async function loadParametros() {
      try {
        const res = await obtenerTodosParametros();
        console.log(res);

        setParametros(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadParametros();
  }, []);
  console.log(parametros);

  return parametros.length > 0 ? (
    <ListaElementos lista={parametros} />
  ) : (
    <p>Cargando parametros...</p>
  );
}
