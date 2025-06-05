import { useForm } from "react-hook-form";
import {
  crearSucursal,
  eliminarSucursal,
  actualizarSucursal,
  obtenerSucursal,
} from "../api/locales.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";

export function LocalesFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  //Desbloquea los campos,
  //  Ademas habilita los botones Guardar y Eliminar
  const [editable, setEditable] = useState(false);

  // Se agrega para elegir la empresa relacionada
  const [empresas, setEmpresas] = useState([]);

  const navigate = useNavigate();
  // Modificar según la página padre
  const pagina = "/locales";
  const params = useParams();

  useEffect(() => {
  async function cargarSucursal() {
    if (params.id) {
      const { data } = await obtenerSucursal(params.id);
      console.log("Sucursal cargada:", data);

      // Guardamos temporalmente la empresa de la sucursal
      const empresaSucursal = data.empresa;

      setValue("descripcion", data.descripcion);
      setValue("titulo_reportes", data.titulo_reportes);
      setValue("estado", data.estado);
      setValue("direccion", data.direccion);

      // Cargamos las empresas
      const resEmpresas = await fetch("http://localhost:8000/api/empresas/");
      const dataEmpresas = await resEmpresas.json();
      setEmpresas(dataEmpresas);

      // Ahora que ya hay opciones, seteamos el valor
      setValue("empresa", empresaSucursal.toString());

    } else {
      reset();
      setEditable(true);
      // También deberías cargar las empresas si no hay params.id
      const resEmpresas = await fetch("http://localhost:8000/api/empresas/");
      const dataEmpresas = await resEmpresas.json();
      setEmpresas(dataEmpresas);
    }
  }
  cargarSucursal();
}, [params.id]);

  /*useEffect(() => {
    async function cargarSucursal() {
      //try {
      if (params.id) {
        const { data } = await obtenerSucursal(params.id);
        console.log("Sucursal cargada:", data);
        setValue("descripcion", data.descripcion);
        setValue("titulo_reportes", data.titulo_reportes);
        setValue("estado", data.estado);
        setValue("direccion", data.direccion);
        setValue("empresa", data.empresa.toString());
//        console.log("Empresa:", data.empresa.id.toString());
      } else {
        reset();
        //Necesario para poder habilitar los campos si se tiene permiso
        setEditable(true);
      }
        // Traer empresas
        const resEmpresas = await fetch("http://localhost:8000/api/empresas/");
        const dataEmpresas = await resEmpresas.json();
        setEmpresas(dataEmpresas);
    /*}
  cargarSucursal();
}, [params.id]);*/

  const onSubmit = handleSubmit(async (data) => {
    if (params.id) {
      console.log("Payload a enviar actualizar:", data);
      await actualizarSucursal(params.id, data);
    } else {
      console.log("Payload a enviar crear:", data);
      await crearSucursal(data);
    }
    navigate(pagina);
  });

  const habilitarEdicion = async () => {
    setEditable(true);
  };

  const descartarSucursal = async () => {
    const aceptar = window.confirm(
      "¿Estás seguro que quieres eliminar esta sucursal?"
    );
    if (aceptar) {
      await eliminarSucursal(params.id);
      navigate(pagina);
    }
  };

  //                          campo que tiene que leer ---- permiso necesario
  const puedeEscribir = tienePermiso("locales", "escritura");
  //const puedeLeer=tienePermiso("permisos","lectura");

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        {/*Modificar el título según la página*/}
        <h1 className="formulario-titulo">Sucursal</h1>
        {/*Modificar el formulario de acuerdo a los campos necesarios*/}
        <form onSubmit={onSubmit} id="editar-sucursal">
          {/*El fieldset permite bloquear la escritura*/}
          <fieldset disabled={!editable}>
            <h4 className="formulario-elemento">Descripción</h4>
            <input
              type="text"
              placeholder="Ingrese la descripción de la sucursal..."
              className="formulario-input"
              {...register("descripcion", { required: true })}
            />
            {/*Mensaje de error si no se completa un campo obligatorio*/}
            {errors.descripcion && <CampoRequerido></CampoRequerido>}
            <h4 className="formulario-elemento">Empresa</h4>
            <select
                  className="formulario-input"
                  {...register("empresa", { required: true })}
              >
              <option value="">Seleccione una empresa</option>
              {empresas
                .filter((e) => e.estado) // solo activas
                .map((empresa) => (
                <option key={empresa.id} value={empresa.id.toString()}>
                  {empresa.descripcion}
                </option>
                ))}
            </select>
            {errors.empresa && <CampoRequerido></CampoRequerido>}
            <div className="flex items-center mt-2">
              <h4 className="formulario-elemento mb-0 mr-2">Activo: </h4>
              <input
                type="checkbox"
                {...register("estado", { required: false })}
              ></input>
            </div>
            <h4 className="formulario-elemento">Título para reportes: </h4>
            <input
              type="text"
              placeholder="Ingrese un título para los reportes de la sucursal..."
              className="formulario-input"
              {...register("titulo_reportes", { required: false })}
            />
            <h4 className="formulario-elemento">Dirección</h4>
            <input
              type="text"
              placeholder="Ingrese la dirección de la sucursal..."
              className="formulario-input"
              {...register("direccion", { required: true })}
            />
            {/*Mensaje de error si no se completa un campo obligatorio*/}
            {errors.direccion && <CampoRequerido></CampoRequerido>}
          </fieldset>
        </form>

        {/*Los botones se activan y desactiva dependiendo del rol
        y de la opcion*/}
        <div className="botones-grupo">
          {puedeEscribir && !editable && (
            <button onClick={habilitarEdicion} className="boton-editar">
              {" "}
              Editar
            </button>
          )}
          {puedeEscribir && editable && (
            <button
              type="submit"
              form="editar-sucursal"
              className="boton-guardar"
            >
              Guardar
            </button>
          )}
          <br />
          {params.id && puedeEscribir && editable && (
            <button onClick={descartarSucursal} className="boton-eliminar">
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
