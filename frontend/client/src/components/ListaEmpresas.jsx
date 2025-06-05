import { useEffect, useState } from "react";
import { obtenerTodasEmpresas } from "../api/empresas.api";
import ListaElementos from "./ListaElementos";

export function ListaEmpresas() {
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    async function loadEmpresas() {
      try {
        const res = await obtenerTodasEmpresas();
        console.log(res);

        setEmpresas(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadEmpresas();
  }, []);
  console.log(empresas);

  return empresas.length > 0 ? (
    <ListaElementos lista={empresas} />
  ) : (
    <p>Cargando empresas...</p>
  );
}
