import { useEffect, useState } from "react";
import { obtenerTodosSaldos } from "../api/saldo_proveedores.api";
import ListaElementos from "./ListaElementos";

export function ListaSaldosProveedores() {
  const [saldos, setSaldos] = useState([]);

  useEffect(() => {
    async function loadSaldos() {
      try {
        const res = await obtenerTodosSaldos();
        console.log(res);

        setSaldos(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadSaldos();
  }, []);
  console.log(saldos);

  return saldos.length > 0 ? (
    <ListaElementos lista={saldos} />
  ) : (
    <p>Aun no existen saldos de proveedores registrados</p>
  );
}
