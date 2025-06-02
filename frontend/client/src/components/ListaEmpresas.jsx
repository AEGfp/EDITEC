/*import { useEffect, useState} from "react"
import { obtenerTodasEmpresas } from "../api/empresas.api";
import { EmpresasCard } from "./EmpresasCard";

export function ListaEmpresas(){
    const [empresas, actualizarEmpresas] = useState([]);
useEffect(() => {

    async function cargarEmpresas(){
        const respuesta = await obtenerTodasEmpresas();
        actualizarEmpresas(respuesta.data);
    }
    cargarEmpresas();
}, [])   
    return <div>
            {empresas.map(empresa => (
               <EmpresasCard key= {empresa.id} empresa={empresa} />
            ))}
        </div>;
}*/
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
