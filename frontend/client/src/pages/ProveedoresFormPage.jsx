import { useForm } from "react-hook-form";
import {
  crearProveedor,
  eliminarProveedor,
  actualizarProveedor,
  obtenerProveedor,
} from "../api/proveedores.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";

export function ProveedoresFormPage() {
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

  // Se agrega para elegir la persona relacionada
  const [personas, setPersonas] = useState([]);

  const navigate = useNavigate();
  // Modificar según la página padre
  const pagina = "/proveedores";
  const params = useParams();

  useEffect(() => {
  async function cargarProveedor() {
    if (params.id) {
      const { data } = await obtenerProveedor(params.id);
      console.log("Proveedor cargado:", data);

      // Guardamos temporalmente la persona del proveedor
      const personaProveedor = data.id_persona;

      setValue("nombre_fantasia", data.nombre_fantasia);
      setValue("ruc", data.ruc);
      setValue("estado", data.estado);
      setValue("telefono", data.telefono);
      setValue("observaciones", data.observaciones);

      // Cargamos las personas
      const resPersonas = await fetch("http://localhost:8000/api/personas/");
      const dataPersonas = await resPersonas.json();
      setPersonas(dataPersonas);

      // Ahora que ya hay opciones, seteamos el valor
      setValue("id_persona", personaProveedor.toString());

    } else {
      reset();
      setEditable(true);
      // También deberías cargar las empresas si no hay params.id
      const resPersonas = await fetch("http://localhost:8000/api/personas/");
      const dataPersonas = await resPersonas.json();
      setPersonas(dataPersonas);
    }
  }
  cargarProveedor();
}, [params.id]);

  const onSubmit = handleSubmit(async (data) => {
    if (params.id) {
      console.log("Payload a enviar actualizar:", data);
      await actualizarProveedor(params.id, data);
    } else {
      console.log("Payload a enviar crear:", data);
      await crearProveedor(data);
    }
    navigate(pagina);
  });

  const habilitarEdicion = async () => {
    setEditable(true);
  };

  const descartarProveedor = async () => {
    const aceptar = window.confirm(
      "¿Estás seguro que quieres eliminar este proveedor?"
    );
    if (aceptar) {
      await eliminarProveedor(params.id);
      navigate(pagina);
    }
  };

  //                          campo que tiene que leer ---- permiso necesario
  const puedeEscribir = tienePermiso("proveedores", "escritura");
  //const puedeLeer=tienePermiso("permisos","lectura");

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        {/*Modificar el título según la página*/}
        <h1 className="formulario-titulo">Proveedor</h1>
        {/*Modificar el formulario de acuerdo a los campos necesarios*/}
        <form onSubmit={onSubmit} id="editar-proveedor">
          {/*El fieldset permite bloquear la escritura*/}
          <fieldset disabled={!editable}>
            <h4 className="formulario-elemento">Nombre Fantasía</h4>
            <input
              type="text"
              placeholder="Ingrese el nombre de fantasía..."
              className="formulario-input"
              {...register("nombre_fantasia", { required: true })}
            />
            {/*Mensaje de error si no se completa un campo obligatorio*/}
            {errors.nombre_fantasia && <CampoRequerido></CampoRequerido>}
            <h4 className="formulario-elemento">Persona asociada</h4>
            <select
                  className="formulario-input"
                  {...register("id_persona", { required: true })}
              >
              <option value="">Seleccione una persona</option>
              {personas
                .map((persona) => (
                <option key={persona.id} value={persona.id.toString()}>
                  {persona.nombre}
                </option>
                ))}
            </select>
            {errors.id_persona && <CampoRequerido></CampoRequerido>}
            <h4 className="formulario-elemento">RUC </h4>
            <input
              type="text"
              placeholder="Ingrese el RUC del proveedor..."
              className="formulario-input"
              {...register("ruc", { required: true })}
            />
            {errors.ruc && <CampoRequerido></CampoRequerido>}
            <h4 className="formulario-elemento">Teléfono</h4>
            <input
              type="text"
              placeholder="Ingrese un teléfono de contacto del proveedor..."
              className="formulario-input"
              {...register("telefono", { required: true })}
            />
            {errors.telefono && <CampoRequerido></CampoRequerido>}
            <h4 className="formulario-elemento">Observaciones</h4>
            <input
              type="text"
              placeholder="Ingrese alguna observación..."
              className="formulario-input"
              {...register("observaciones", { required: false })}
            />
            <div className="flex items-center mt-2">
              <h4 className="formulario-elemento mb-0 mr-2">Activo: </h4>
              <input
                type="checkbox"
                {...register("estado", { required: false })}
              ></input>
            </div>
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
              form="editar-proveedor"
              className="boton-guardar"
            >
              Guardar
            </button>
          )}
          <br />
          {params.id && puedeEscribir && editable && (
            <button onClick={descartarProveedor} className="boton-eliminar">
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}