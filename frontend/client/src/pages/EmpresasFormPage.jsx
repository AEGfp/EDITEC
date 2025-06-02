/*export function EmpresasFormPage() {
    return(
        <div>Empresas Form</div>
    )
}*/
import { useForm } from "react-hook-form";
import {
  crearEmpresa,
  eliminarEmpresa,
  actualizarEmpresa,
  obtenerEmpresa,
} from "../api/empresas.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";

export function EmpresasFormPage() {
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

  const navigate = useNavigate();
  // Modificar según la página padre
  const pagina = "/empresas";
  const params = useParams();

  useEffect(() => {
    async function cargarEmpresa() {
      if (params.id) {
        const { data } = await obtenerEmpresa(params.id);
        setValue("descripcion", data.descripcion);
        setValue("titulo_reportes", data.titulo_reportes);
        setValue("estado", data.estado);
        setValue("direccion", data.direccion);
        setValue("ruc", data.ruc);
        setValue("telefono", data.telefono);
        setValue("actividad", data.actividad);
      } else {
        reset();
        //Necesario para poder habilitar los campos si se tiene permiso
        setEditable(true);
      }
    }
    cargarEmpresa();
  }, [params.id]);

  const onSubmit = handleSubmit(async (data) => {
    if (params.id) {
      console.log("Payload a enviar actualizar:", data);
      await actualizarEmpresa(params.id, data);
    } else {
      console.log("Payload a enviar crear:", data);
      await crearEmpresa(data);
    }
    navigate(pagina);
  });

  const habilitarEdicion = async () => {
    setEditable(true);
  };

  const descartarEmpresa = async () => {
    const aceptar = window.confirm(
      "¿Estás seguro que quieres eliminar esta empresa?"
    );
    if (aceptar) {
      await eliminarEmpresa(params.id);
      navigate(pagina);
    }
  };

  //                          campo que tiene que leer ---- permiso necesario
  const puedeEscribir = tienePermiso("empresas", "escritura");
  //const puedeLeer=tienePermiso("permisos","lectura");

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        {/*Modificar el título según la página*/}
        <h1 className="formulario-titulo">Empresa</h1>
        {/*Modificar el formulario de acuerdo a los campos necesarios*/}
        <form onSubmit={onSubmit} id="editar-empresa">
          {/*El fieldset permite bloquear la escritura*/}
          <fieldset disabled={!editable}>
            <h4 className="formulario-elemento">Descripción</h4>
            <input
              type="text"
              placeholder="Ingrese la descripción de la empresa..."
              className="formulario-input"
              {...register("descripcion", { required: true })}
            />
            {/*Mensaje de error si no se completa un campo obligatorio*/}
            {errors.descripcion && <CampoRequerido></CampoRequerido>}
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
              placeholder="Ingrese un título para los reportes de la empresa..."
              className="formulario-input"
              {...register("titulo_reportes", { required: false })}
            />
            <h4 className="formulario-elemento">Dirección</h4>
            <input
              type="text"
              placeholder="Ingrese la dirección de la empresa..."
              className="formulario-input"
              {...register("direccion", { required: true })}
            />
            {/*Mensaje de error si no se completa un campo obligatorio*/}
            {errors.direccion && <CampoRequerido></CampoRequerido>}
            <h4 className="formulario-elemento">RUC</h4>
            <input
              type="text"
              placeholder="Ingrese el RUC..."
              className="formulario-input"
              {...register("ruc", { required: true })}
            />
            {/*Mensaje de error si no se completa un campo obligatorio*/}
            {errors.ruc && <CampoRequerido></CampoRequerido>}
            <h4 className="formulario-elemento">Actividad</h4>
            <input
              type="text"
              placeholder="Ingrese la actividad económica de la empresa..."
              className="formulario-input"
              {...register("actividad", { required: true })}
            />
            {/*Mensaje de error si no se completa un campo obligatorio*/}
            {errors.actividad && <CampoRequerido></CampoRequerido>}
            <h4 className="formulario-elemento">Teléfono</h4>
            <input
              type="text"
              placeholder="Ingrese el teléfono de la empresa..."
              className="formulario-input"
              {...register("telefono", { required: true })}
            />
            {/*Mensaje de error si no se completa un campo obligatorio*/}
            {errors.telefono && <CampoRequerido></CampoRequerido>}
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
              form="editar-empresa"
              className="boton-guardar"
            >
              Guardar
            </button>
          )}
          <br />
          {params.id && puedeEscribir && editable && (
            <button onClick={descartarEmpresa} className="boton-eliminar">
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
