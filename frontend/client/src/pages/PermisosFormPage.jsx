import { useForm } from "react-hook-form";
import {
  crearPermiso,
  eliminarPermiso,
  actualizarPermiso,
  obtenerPermiso,
} from "../api/permisos.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

export function PermisosFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

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

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="descripcion"
          {...register("descripcion", { required: true })}
        />
        {errors.descripcion && <span>Campo requerido</span>}
        <input
          type="checkbox"
          {...register("activo", { required: false })}
        ></input>

        <button>Guardar</button>
      </form>
      {params.id && (
        <button
          onClick={async () => {
            const aceptar = window.confirm(
              "¿Estás seguro que quieres eliminar este elemento?"
            );
            if (aceptar) {
              await eliminarPermiso(params.id);
              navigate("/permisos");
            }
          }}
        >
          Eliminar
        </button>
      )}
    </div>
  );
}
