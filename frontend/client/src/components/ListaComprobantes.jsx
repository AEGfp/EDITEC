import { useEffect, useState } from "react";
import { obtenerTodosComprobantes} from "../api/comprobante_proveedor.api";
import ListaElementos from "./ListaElementos";

export function ListaComprobantes() {
  const [comprobantes, setComprobantes] = useState([]);

  useEffect(() => {
    async function loadComprobantes() {
      try {
        const res = await obtenerTodosComprobantes();
        console.log(res);

        setComprobantes(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadComprobantes();
  }, []);
  console.log(comprobantes);

  return comprobantes.length > 0 ? (
    <ListaElementos lista={comprobantes} />
  ) : (
    <p>Aun no existen comprobantes registrados</p>
  );
}
