import { useEffect, useState } from "react";
import { obtenerTodasSucursales } from "../api/locales.api";
import ListaElementos from "./ListaElementos";

export function ListaLocales() {
  const [sucursales, setSucursales] = useState([]);

  useEffect(() => {
    async function loadSucursales() {
      try {
        const res = await obtenerTodasSucursales();
        console.log(res);

        setSucursales(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadSucursales();
  }, []);
  console.log(sucursales);

  return sucursales.length > 0 ? (
    <ListaElementos lista={sucursales} />
  ) : (
    <p>Cargando sucursales...</p>
  );
}
