import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  crearInforme,
  obtenerTodosTiposInforme,
  obtenerInforme,
  actualizarInforme,
} from "../api/informes.api";
import CampoRequerido from "../components/CampoRequerido";
import tienePermiso from "../utils/tienePermiso";
import { obtenerTodosIndicadores } from "../api/indicadores.api";
import { obtenerInfantes } from "../api/infantes.api";
import MostrarError from "../components/MostrarError";

export function InformesFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const [indicadoresDisponibles, setIndicadoresDisponibles] = useState([]);
  const [tiposInformes, setTiposInforme] = useState([]);
  const [infantes, setInfantes] = useState([]);
  const [descripcionVisible, setDescripcionVisible] = useState({});
  const [errorBackend, setErrorBackend] = useState(null);

  const params = useParams();
  const navigate = useNavigate();
  const puedeEscribir = tienePermiso("informes", "escritura");
  const tipoInformeSeleccionado = watch("id_tipo_informe");

  useEffect(() => {
    async function cargarDatos() {
      const dataIndicadores = await obtenerTodosIndicadores();
      const dataTiposInforme = await obtenerTodosTiposInforme();
      const dataInfantes = await obtenerInfantes();

      setIndicadoresDisponibles(dataIndicadores.data);
      setTiposInforme(dataTiposInforme.data);
      setInfantes(dataInfantes.data);

      if (params.id) {
        const { data } = await obtenerInforme(params.id);
        setValue("id_infante", data.id_infante);
        setValue("id_tipo_informe", data.id_tipo_informe);
        setValue("fecha_informe", data.fecha_informe);
        setValue("observaciones", data.observaciones);
      }
    }
    cargarDatos();
  }, [params.id, setValue]);

  const indicadoresFiltrados = indicadoresDisponibles.filter(
    (i) => i.id_tipo_informe == tipoInformeSeleccionado
  );

  const onSubmit = handleSubmit(async (data) => {
    setErrorBackend(null);
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      const indicadores = indicadoresFiltrados.map((i) => ({
        id_indicador: i.id,
        ind_logrado: data[`logrado_${i.id}`] === "true",
      }));

      const datos = {
        ...data,
        id_usuario_aud: usuario.id,
        indicadores,
      };

      if (params.id) await actualizarInforme(params.id, datos);
      else await crearInforme(datos);

      navigate("/informes");
    } catch (error) {
      setErrorBackend(error.response?.data || "Error desconocido");
    }
  });

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-xl mx-auto bg-white shadow rounded-xl p-6 border border-blue-100">
      <h1 className="text-xl font-bold text-blue-900 text-center bg-blue-200 py-3 rounded-md mb-6">
  {params.id ? "📝 Detalles del Informe" : "🧒 Nuevo Informe"}
</h1>



        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Infante:</label>
            <select
              {...register("id_infante", { required: true })}
              className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Seleccione un infante</option>
              {infantes.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.id_persona?.nombre} {i.id_persona?.apellido}
                </option>
              ))}
            </select>
            {errors.id_infante && <CampoRequerido />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Informe:</label>
            <select
              {...register("id_tipo_informe", { required: true })}
              className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Seleccione un tipo</option>
              {tiposInformes.map((t) => (
                <option key={t.id} value={t.id}>{t.descripcion}</option>
              ))}
            </select>
            {errors.id_tipo_informe && <CampoRequerido />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Informe:</label>
            <input
              type="date"
              {...register("fecha_informe", { required: true })}
              className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.fecha_informe && <CampoRequerido />}
          </div>

          {tipoInformeSeleccionado && indicadoresFiltrados.map((indicador) => (
            <div key={indicador.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {indicador.nombre}
              </label>
              <select
                {...register(`logrado_${indicador.id}`, { required: true })}
                className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">¿Logrado?</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
              <button
                type="button"
                onClick={() => setDescripcionVisible((prev) => ({ ...prev, [indicador.id]: !prev[indicador.id] }))}
                className="text-blue-600 text-xs underline mt-1"
              >
                {descripcionVisible[indicador.id] ? "Ocultar descripción" : "Ver descripción"}
              </button>
              {descripcionVisible[indicador.id] && (
                <p className="text-sm text-gray-500 mt-1">{indicador.descripcion}</p>
              )}
              {errors[`logrado_${indicador.id}`] && <CampoRequerido />}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones:</label>
            <textarea
              {...register("observaciones", { required: true })}
              className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>
            {errors.observaciones && <CampoRequerido />}
          </div>

          {errorBackend && <MostrarError errores={errorBackend} />}

          <div className="flex justify-center">
            {puedeEscribir && (
              <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-base font-bold rounded-lg shadow transition duration-150"
            >
               💾 Guardar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
