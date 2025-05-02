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
import controlarRoles from "../utils/tienePermiso";

export function PermisosFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const [editable, setEditable] = useState(false);

  const navigate = useNavigate();
  const params = useParams();

  const onSubmit = handleSubmit(async (data) => {
    if (params.id) {
      await actualizarPermiso(params.id, data);
    } else {
      await crearPermiso(data);
    }
    navigate("/permisos");
  });

  useEffect(() => {
    async function cargarPermiso() {
      if (params.id) {
        const { data } = await obtenerPermiso(params.id);
        setValue("descripcion", data.descripcion);
        setValue("activo", data.activo);
      }
    }
    cargarPermiso();
  }, []);

  const habilitarEdicion = async () => {
    setEditable(true);
  };

  const descartarPermiso = async () => {
    const aceptar = window.confirm(
      "¿Estás seguro que quieres eliminar este elemento?"
    );
    if (aceptar) {
      await eliminarPermiso(params.id);
      navigate("/permisos");
    }
  };

  const puedeEscribir = controlarRoles("escritura");
  //const puedeLeer=controlarRoles("lectura");

  return (
    <div>
      <form onSubmit={onSubmit} id="editar-permiso">
        <fieldset disabled={!editable}>
          <h4>Descripción</h4>
          <input
            type="text"
            placeholder="descripcion"
            {...register("descripcion", { required: true })}
          />
          {errors.descripcion && <span>Campo requerido</span>}
          <h4>Activo</h4>
          <input
            type="checkbox"
            {...register("activo", { required: false })}
          ></input>
          <br />
        </fieldset>
      </form>

      {puedeEscribir && !editable && (
        <button onClick={habilitarEdicion}> Editar</button>
      )}

      {puedeEscribir && editable && (
        <button type="submit" form="editar-permiso">
          Guardar
        </button>
      )}
      <br />
      {params.id && puedeEscribir && editable && (
        <button onClick={descartarPermiso}>Eliminar</button>
      )}
    </div>
  );
}
