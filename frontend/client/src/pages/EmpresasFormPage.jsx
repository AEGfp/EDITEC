import { useForm } from "react-hook-form";
import {
  crearEmpresa,
  eliminarEmpresa,
  actualizarEmpresa,
  obtenerEmpresa,
} from "../api/empresas.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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

  const [editable, setEditable] = useState(false);
  const navigate = useNavigate();
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
        setEditable(true);
      }
    }
    cargarEmpresa();
  }, [params.id]);

  const onSubmit = handleSubmit(async (data) => {
    if (params.id) {
      await actualizarEmpresa(params.id, data);
    } else {
      await crearEmpresa(data);
    }
    navigate(pagina);
  });

  const habilitarEdicion = () => {
    setEditable(true);
  };

  const descartarEmpresa = async () => {
    const aceptar = window.confirm("¿Estás seguro que quieres eliminar esta empresa?");
    if (aceptar) {
      await eliminarEmpresa(params.id);
      navigate(pagina);
    }
  };

  const puedeEscribir = tienePermiso("empresas", "escritura");

  return (
    <div className="min-h-screen bg-blue-50 flex justify-center items-center py-10">
      <div className="bg-white rounded-xl shadow-md w-full max-w-xl p-6">
        <div className="bg-blue-100 rounded-md px-4 py-2 mb-6 text-center">
          <h2 className="text-lg font-bold text-blue-700 flex items-center justify-center gap-2">
            🏢 {params.id ? "Empresa" : "Nueva Empresa"}
          </h2>
        </div>

        <form onSubmit={onSubmit} id="editar-empresa" className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Descripción</label>
            <input
              type="text"
              placeholder="Ingrese la descripción de la empresa..."
              className="formulario-input"
              {...register("descripcion", { required: true })}
              disabled={!editable}
            />
            {errors.descripcion && <CampoRequerido />}
          </div>

          <div className="flex items-center">
            <label className="block mb-1 font-medium mr-2">Activo:</label>
            <input
              type="checkbox"
              {...register("estado")}
              disabled={!editable}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Título para reportes</label>
            <input
              type="text"
              placeholder="Ingrese un título para los reportes de la empresa..."
              className="formulario-input"
              {...register("titulo_reportes")}
              disabled={!editable}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Dirección</label>
            <input
              type="text"
              placeholder="Ingrese la dirección de la empresa..."
              className="formulario-input"
              {...register("direccion", { required: true })}
              disabled={!editable}
            />
            {errors.direccion && <CampoRequerido />}
          </div>

          <div>
            <label className="block mb-1 font-medium">RUC</label>
            <input
              type="text"
              placeholder="Ingrese el RUC..."
              className="formulario-input"
              {...register("ruc", { required: true })}
              disabled={!editable}
            />
            {errors.ruc && <CampoRequerido />}
          </div>

          <div>
            <label className="block mb-1 font-medium">Actividad</label>
            <input
              type="text"
              placeholder="Ingrese la actividad económica de la empresa..."
              className="formulario-input"
              {...register("actividad", { required: true })}
              disabled={!editable}
            />
            {errors.actividad && <CampoRequerido />}
          </div>

          <div>
            <label className="block mb-1 font-medium">Teléfono</label>
            <input
              type="text"
              placeholder="Ingrese el teléfono de la empresa..."
              className="formulario-input"
              {...register("telefono", { required: true })}
              disabled={!editable}
            />
            {errors.telefono && <CampoRequerido />}
          </div>

          <div className="flex justify-center mt-6 gap-3">
            {puedeEscribir && !editable && (
              <button type="button" onClick={habilitarEdicion} className="boton-editar">
                ✏️ Editar
              </button>
            )}
            {puedeEscribir && editable && (
              <>
                <button type="submit" className="boton-guardar">
                  💾 Guardar
                </button>
                {params.id && (
                  <button type="button" onClick={descartarEmpresa} className="boton-eliminar">
                    🗑️ Eliminar
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmpresasFormPage;
