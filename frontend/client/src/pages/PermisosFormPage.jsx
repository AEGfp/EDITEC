import { useForm } from "react-hook-form";
import {
  crearPermiso,
  eliminarPermiso,
  actualizarPermiso,
  obtenerPermiso,
} from "../api/permisos.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";
export function PermisosFormPage() {
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
  const pagina = "/permisos";
  const params = useParams();

  useEffect(() => {
    async function cargarPermiso() {
      if (params.id) {
        const { data } = await obtenerPermiso(params.id);
        setValue("descripcion", data.descripcion);
        setValue("activo", data.activo);
      } else {
        reset();
        //Necesario para poder habilitar los campos si se tiene permiso
        setEditable(true);
      }
    }
    cargarPermiso();
  }, [params.id]);

  const onSubmit = handleSubmit(async (data) => {
    if (params.id) {
      await actualizarPermiso(params.id, data);
    } else {
      await crearPermiso(data);
    }
    navigate(pagina);
  });

  const habilitarEdicion = async () => {
    setEditable(true);
  };

  const descartarPermiso = async () => {
    const aceptar = window.confirm(
      "¿Estás seguro que quieres eliminar este elemento?"
    );
    if (aceptar) {
      await eliminarPermiso(params.id);
      navigate(pagina);
    }
  };

  //                          campo que tiene que leer ---- permiso necesario
  const puedeEscribir = tienePermiso("permisos", "escritura");
  //const puedeLeer=tienePermiso("permisos","lectura");

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        {/*Modificar el título según la página*/}
        <h1 className="formulario-titulo">Permiso</h1>
        {/*Modificar el formulario de acuerdo a los campos necesarios*/}
        <form onSubmit={onSubmit} id="editar-permiso">
          {/*El fieldset permite bloquear la escritura*/}
          <fieldset disabled={!editable}>
            <h4 className="formulario-elemento">Descripción</h4>
            <input
              type="text"
              placeholder="Ingrese un permiso..."
              className="formulario-input"
              {...register("descripcion", { required: true })}
            />
            {/*Mensaje de error si no se completa un campo obligatorio*/}
            {errors.descripcion && <CampoRequerido></CampoRequerido>}
            <div className="flex items-center mt-2">
              <h4 className="formulario-elemento mb-0 mr-2">Activo: </h4>
              <input
                type="checkbox"
                {...register("activo", { required: false })}
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
              form="editar-permiso"
              className="boton-guardar"
            >
              Guardar
            </button>
          )}
          <br />
          {params.id && puedeEscribir && editable && (
            <button onClick={descartarPermiso} className="boton-eliminar">
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
