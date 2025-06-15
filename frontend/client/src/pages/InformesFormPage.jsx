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
import { obtenerInfantesAsignados } from "../api/asistencias.api";

export function InformesFormPage() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      indicadores: [{ id_indicador: "", ind_logrado: false }],
    },
  });

  const [indicadoresDisponibles, setIndicadoresDisponibles] = useState([]);
  const [tiposInformes, setTiposInforme] = useState([]);
  const [infantes, setInfantes] = useState([]);
  const [descripcionVisible, setDescripcionVisible] = useState({});
  const [editable, setEditable] = useState(false);
  const [indicadoresInforme, setIndicadoresInforme] = useState([]);

  const params = useParams();

  const tipoInformeSeleccionado = watch("id_tipo_informe");
  const navigate = useNavigate();
  const puedeEscribir = tienePermiso("informes", "escritura");

  useEffect(() => {
    async function cargarIndicadores() {
      const dataIndicadores = await obtenerTodosIndicadores();
      const dataTiposInforme = await obtenerTodosTiposInforme();
      const dataInfantes = await obtenerInfantesAsignados();

      setIndicadoresDisponibles(dataIndicadores.data);
      setTiposInforme(dataTiposInforme.data);
      setInfantes(dataInfantes.data);

      if (params.id) {
        const { data } = await obtenerInforme(params.id);

        setValue("id_infante", data.id_infante);
        setValue("id_tipo_informe", data.id_tipo_informe);
        setValue("fecha_informe", data.fecha_informe);
        setValue("observaciones", data.observaciones);
        setIndicadoresInforme(data.indicadores || []);
      } else {
        setEditable(true);
      }
    }
    cargarIndicadores();
  }, [params.id, setValue]);

  const indicadoresFiltrados = indicadoresDisponibles.filter(
    (indicador) => indicador.id_tipo_informe == tipoInformeSeleccionado
  );

  const onSubmit = handleSubmit(async (data) => {
    try {
      const usuarioStr = localStorage.getItem("usuario");
      const usuario = JSON.parse(usuarioStr);
      const indicadores = indicadoresFiltrados.map((indicador) => ({
        id_indicador: indicador.id,
        ind_logrado: data[`logrado_${indicador.id}`] === "true",
      }));

      const dataCompleto = {
        ...data,
        id_usuario_aud: usuario.id,
        indicadores,
      };

      if (params.id) {
        // await actualizarInforme(params.id, dataCompleto); // si tenés esta función
      } else {
        await crearInforme(dataCompleto);
      }

      navigate("/informes");
    } catch (error) {
      console.error("Error al guardar informe:", error.response?.data || error);
    }
  });

  const toggleDescripcion = (id) => {
    setDescripcionVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">Crear Informe</h1>

        <form onSubmit={onSubmit}>
          <fieldset disabled={!editable}>
            <h4 className="formulario-elemento">Infante</h4>
            <select
              className="formulario-input"
              {...register("id_infante", { required: true })}
            >
              <option value="">Seleccione un infante</option>
              {infantes.map(({ infante }) => (
                <option key={infante.id} value={infante.id}>
                  {infante.id_persona?.nombre} {infante.id_persona?.apellido}{" "}
                  {infante.id_persona?.segundo_apellido}
                </option>
              ))}
            </select>
            {errors.id_infante && <CampoRequerido />}

            <h4 className="formulario-elemento">Tipo de Informe</h4>
            <select
              className="formulario-input"
              {...register("id_tipo_informe", { required: true })}
            >
              <option value="">Seleccione un tipo</option>
              {tiposInformes.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.descripcion}
                </option>
              ))}
            </select>
            {errors.id_tipo_informe && <CampoRequerido />}

            <h4 className="formulario-elemento">Fecha del Informe</h4>
            <input
              type="date"
              className="formulario-input"
              {...register("fecha_informe", { required: true })}
            />
            {errors.fecha_informe && <CampoRequerido />}

            {tipoInformeSeleccionado && (
              <>
                <h4 className="formulario-elemento">Indicadores</h4>
                {indicadoresFiltrados.length === 0 && (
                  <p className="text-gray-500">
                    No hay indicadores para este tipo de informe.
                  </p>
                )}
                {indicadoresFiltrados.map((indicador) => (
                  <div key={indicador.id} className="mb-2">
                    <label className="formulario-elemento">
                      {indicador.nombre}
                    </label>
                    <select
                      className="formulario-input"
                      {...register(`logrado_${indicador.id}`, {
                        required: true,
                      })}
                    >
                      <option value="">¿Logrado?</option>
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                    {errors[`logrado_${indicador.id}`] && <CampoRequerido />}

                    <button
                      type="button"
                      onClick={() => toggleDescripcion(indicador.id)}
                      className="text-blue-600 underline text-sm mt-1"
                    >
                      {descripcionVisible[indicador.id]
                        ? "Ocultar descripción"
                        : "Ver descripción"}
                    </button>

                    {descripcionVisible[indicador.id] && (
                      <p className="text-sm text-gray-600 mt-1">
                        {indicador.descripcion}
                      </p>
                    )}
                  </div>
                ))}
              </>
            )}
            <h4 className="formulario-elemento">Observaciones</h4>
            <textarea
              className="formulario-input"
              {...register("observaciones", { required: true })}
            />
            {errors.observaciones && <CampoRequerido />}
            <br />
            <br />
            <div className="botones-grupo">
              {/*puedeEscribir && !editable && (
                <button
                  onClick={() => setEditable(true)}
                  className="boton-editar"
                >
                  Editar
                </button>
              )*/}
              {puedeEscribir && editable && (
                <button type="submit" className="boton-guardar">
                  Guardar
                </button>
              )}
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
