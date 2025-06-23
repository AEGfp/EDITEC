import { useEffect, useState } from "react";
import { obtenerTodasCajasCobros } from "../api/cobrocuotas.api";
import ListaElementos from "./ListaElementos";

export function ListaCajasCobros() {
  const [cajas, setCajas] = useState([]);

  useEffect(() => {
    async function loadCajasCobros() {
      try {
        const res = await obtenerTodasCajasCobros();
        console.log(res);

        setCajas(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadCajasCobros();
  }, []);
  console.log(cajas);

  return cajas.length > 0 ? (
    <ListaElementos lista={cajas} />
  ) : (
    <p>Aun no existen cajas registradas para Cobros</p>
  );
}
