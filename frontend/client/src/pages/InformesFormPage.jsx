import { useForm, useFieldArray } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearInforme, obtenerTodosTiposInforme } from "../api/informes.api"; // Asegúrate de tener esta función
import CampoRequerido from "../components/CampoRequerido";
import tienePermiso from "../utils/tienePermiso";
import { obtenerTodosIndicadores } from "../api/indicadores.api"; // Asume que devuelve todos
import { obtenerInfantesAsignados } from "../api/asistencias.api";

export function InformesFormPage() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      indicadores: [{ id_indicador: "", ind_logrado: false }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "indicadores",
  });

  const [indicadoresDisponibles, setIndicadoresDisponibles] = useState([]);
  const [tiposInformes, setTiposInforme] = useState([]);
  const [infantes, setInfantes] = useState([]);
  const [editable] = useState(true);
  const navigate = useNavigate();
  const puedeEscribir = tienePermiso("informes", "escritura");

  useEffect(() => {
    async function cargarIndicadores() {
      const dataIndicadores = await obtenerTodosIndicadores();
      const dataTiposInforme = await obtenerTodosTiposInforme();
      const dataInfantes = await obtenerInfantesAsignados();
      setIndicadoresDisponibles(dataIndicadores.data);

      console.log("tipos", dataTiposInforme);
      setTiposInforme(dataTiposInforme.data);
      console.log("infantes", dataInfantes);
      setInfantes(dataInfantes.data);
    }
    cargarIndicadores();
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const usuarioStr = localStorage.getItem("usuario");
      const usuario = JSON.parse(usuarioStr);
      const dataCompleto = { ...data, id_usuario_aud: usuario.id };
      await crearInforme(dataCompleto);
      navigate("/informes");
    } catch (error) {
      console.error("Error al crear informe:", error.response?.data || error);
    }
  });

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">Crear Informe</h1>
        <form onSubmit={onSubmit} id="crear-informe">
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
                  {tipo?.descripcion}
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

            <h4 className="formulario-elemento">Observaciones</h4>
            <textarea
              className="formulario-input"
              {...register("observaciones", { required: true })}
            />
            {errors.observaciones && <CampoRequerido />}

            <h4 className="formulario-elemento">Indicadores</h4>
            {fields.map((item, index) => (
              <div key={item.id} className="flex gap-4 mb-2">
                <select
                  className="formulario-input"
                  {...register(`indicadores.${index}.id_indicador`, {
                    required: true,
                  })}
                >
                  <option value="">Seleccione un indicador</option>
                  {indicadoresDisponibles.map((indicador) => (
                    <option key={indicador.id} value={indicador.id}>
                      {indicador.descripcion}
                    </option>
                  ))}
                </select>
                <select
                  className="formulario-input"
                  {...register(`indicadores.${index}.ind_logrado`, {
                    required: true,
                  })}
                >
                  <option value="">¿Logrado?</option>
                  <option value={true}>Sí</option>
                  <option value={false}>No</option>
                </select>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="boton-eliminar"
                >
                  Quitar
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => append({ id_indicador: "", ind_logrado: false })}
            >
              Añadir Indicador
            </button>
          </fieldset>

          <br />
          {puedeEscribir && (
            <button type="submit" className="boton-guardar">
              Guardar Informe
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
