import { useEffect, useState } from "react";
import { obtenerTodasCajasPagos } from "../api/cajaspagos.api";
import ListaElementos from "./ListaElementos";

export function ListaCajasPagos() {
  const [cajas, setCajas] = useState([]);

  useEffect(() => {
    async function loadCajasPagos() {
      try {
        const res = await obtenerTodasCajasPagos();
        console.log(res);

        setCajas(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadCajasPagos();
  }, []);
  console.log(cajas);

  return cajas.length > 0 ? (
    <ListaElementos lista={cajas} />
  ) : (
    <p>Aun no existen cajas registradas para pagos</p>
  );
}
