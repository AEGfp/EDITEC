import { useEffect, useState } from "react";
import { obtenerTodasCuotas } from "../api/saldocuotas.api";
import ListaElementos from "./ListaElementos";

export function ListaCuotas() {
  const [cuotas, setCuotas] = useState([]);

  useEffect(() => {
    async function loadCuotas() {
      try {
        const res = await obtenerTodasCuotas();
        console.log(res);

        setCuotas(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadCuotas();
  }, []);
  console.log(cuotas);

  return cuotas.length > 0 ? (
    <ListaElementos lista={cuotas} />
  ) : (
    <p>Cargando cuotas...</p>
  );
}
