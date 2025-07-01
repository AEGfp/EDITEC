import { useForm } from "react-hook-form";
import {
  crearSucursal,
  eliminarSucursal,
  actualizarSucursal,
  obtenerSucursal,
} from "../api/locales.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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

  const [editable, setEditable] = useState(false);
  const [empresas, setEmpresas] = useState([]);

  const navigate = useNavigate();
  const pagina = "/locales";
  const params = useParams();

  useEffect(() => {
    async function cargarSucursal() {
      try {
        const resEmpresas = await fetch("http://localhost:8000/api/empresas/");
        const dataEmpresas = await resEmpresas.json();
        setEmpresas(dataEmpresas);

        if (params.id) {
          const { data } = await obtenerSucursal(params.id);
          setValue("descripcion", data.descripcion);
          setValue("titulo_reportes", data.titulo_reportes);
          setValue("estado", data.estado);
          setValue("direccion", data.direccion);
          setValue("empresa", data.empresa.toString());
        } else {
          reset();
          setEditable(true);
        }
      } catch (error) {
        console.error("Error al cargar la sucursal o empresas", error);
      }
    }
    cargarSucursal();
  }, [params.id]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (params.id) {
        await actualizarSucursal(params.id, data);
      } else {
        await crearSucursal(data);
      }
      navigate(pagina);
    } catch (error) {
      console.error("Error al guardar la sucursal", error);
    }
  });

  const habilitarEdicion = () => setEditable(true);

  const descartarSucursal = async () => {
    const confirmar = window.confirm("¿Estás seguro que quieres eliminar esta sucursal?");
    if (confirmar) {
      await eliminarSucursal(params.id);
      navigate(pagina);
    }
  };

  const puedeEscribir = tienePermiso("locales", "escritura");

  return (
    <div className="min-h-screen bg-blue-50 flex justify-center items-center py-10">
      <div className="bg-white rounded-xl shadow-md w-full max-w-xl p-6">
        <div className="bg-blue-100 rounded-md px-4 py-2 mb-6 text-center">
          <h2 className="text-lg font-bold text-blue-700 flex items-center justify-center gap-2">
            🏢 {params.id ? "Sucursal" : "Nueva Sucursal"}
          </h2>
        </div>

        <form onSubmit={onSubmit} id="editar-sucursal" className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Descripción</label>
            <input
              type="text"
              className="formulario-input"
              placeholder="Ingrese la descripción de la sucursal..."
              {...register("descripcion", { required: true })}
              disabled={!editable}
            />
            {errors.descripcion && <CampoRequerido />}
          </div>

          <div>
            <label className="block mb-1 font-medium">Empresa</label>
            <select
              className="formulario-input"
              {...register("empresa", { required: true })}
              disabled={!editable}
            >
              <option value="">Seleccione una empresa</option>
              {empresas
                .filter((e) => e.estado)
                .map((empresa) => (
                  <option key={empresa.id} value={empresa.id.toString()}>
                    {empresa.descripcion}
                  </option>
                ))}
            </select>
            {errors.empresa && <CampoRequerido />}
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
              className="formulario-input"
              placeholder="Ingrese un título para los reportes..."
              {...register("titulo_reportes")}
              disabled={!editable}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Dirección</label>
            <input
              type="text"
              className="formulario-input"
              placeholder="Ingrese la dirección de la sucursal..."
              {...register("direccion", { required: true })}
              disabled={!editable}
            />
            {errors.direccion && <CampoRequerido />}
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
                  <button type="button" onClick={descartarSucursal} className="boton-eliminar">
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

export default LocalesFormPage;
