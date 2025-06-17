import { useForm } from "react-hook-form";
import {
  crearNotificacion,
  actualizarNotificacion,
  eliminarNotificacion,
  obtenerNotificacion,
} from "../api/notificaciones.api";
import { obtenerSalas } from "../api/salas.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";
import Select from "react-select";

function NotificacionesFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm();

  const eventoSeleccionado = watch("evento");
  const [editable, setEditable] = useState(false);
  const [salas, setSalas] = useState([]);
  const [salasSeleccionadas, setSalasSeleccionadas] = useState([]);
  const [salasExcluidas, setSalasExcluidas] = useState([]);

  const navigate = useNavigate();
  const params = useParams();
  const pagina = "/notificaciones";
  const puedeEscribir = tienePermiso("notificaciones", "escritura");

  const opcionesSalas = salas.map((s) => ({ value: s.id, label: s.descripcion }));

  // Autocompletar título según evento
  useEffect(() => {
    if (!editable) return;

    if (eventoSeleccionado === "cumple") {
      setValue("titulo", "Notificación de cumpleaños");
    } else if (eventoSeleccionado === "cancelacion") {
      setValue("titulo", "Cancelación de actividad");
    } else if (eventoSeleccionado === "personalizado") {
      setValue("titulo", "");
    }
  }, [eventoSeleccionado, setValue, editable]);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const resSalas = await obtenerSalas();
        setSalas(resSalas.data);

        if (params.id) {
          const { data } = await obtenerNotificacion(params.id);

          setValue("titulo", data.titulo);
          setValue("mensaje", data.contenido);
          setValue("fecha", data.fecha || ""); // ✅ CAMPO CORREGIDO
          setValue("hora", data.hora || "");   // ✅ CAMPO CORREGIDO
          setValue("evento", data.evento || "");
          setValue("enviar_a_todos", data.enviar_a_todos || false);

          const seleccionadas = data.salas_destinatarias?.map((id) => {
            const sala = resSalas.data.find((s) => s.id === id);
            return { value: id, label: sala?.descripcion || `Sala ${id}` };
          }) || [];

          const excluidas = data.salas_excluidas?.map((id) => {
            const sala = resSalas.data.find((s) => s.id === id);
            return { value: id, label: sala?.descripcion || `Sala ${id}` };
          }) || [];

          setSalasSeleccionadas(seleccionadas);
          setSalasExcluidas(excluidas);

          setValue("salas_destinatarias", seleccionadas.map((s) => s.value));
          setValue("salas_excluidas", excluidas.map((s) => s.value));

          setEditable(false);
        } else {
          reset({ enviar_a_todos: false });
          setEditable(true);
        }
      } catch (error) {
        console.error("Error al cargar la notificación o salas", error);
      }
    }

    cargarDatos();
  }, [params.id, reset, setValue]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        contenido: data.mensaje,
        fecha: data.fecha, // ✅ CAMPO CORRECTO
        hora: data.hora,   // ✅ CAMPO CORRECTO
        salas_destinatarias: salasSeleccionadas.map((s) => s.value),
        salas_excluidas: salasExcluidas.map((s) => s.value),
        enviar_a_todos: data.enviar_a_todos || false,
      };

      if (params.id) {
        await actualizarNotificacion(params.id, payload);
      } else {
        await crearNotificacion(payload);
      }

      navigate(pagina);
    } catch (error) {
      console.error("Error al guardar la notificación", error);
    }
  };

  const habilitarEdicion = () => setEditable(true);

  const descartarNotificacion = async () => {
    const confirmar = window.confirm("¿Estás seguro que quieres eliminar esta notificación?");
    if (confirmar) {
      await eliminarNotificacion(params.id);
      navigate(pagina);
    }
  };

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">Notificación</h1>
        <form onSubmit={handleSubmit(onSubmit)} id="editar-notificacion">
          <fieldset disabled={!editable}>
            <h4 className="formulario-elemento">Evento</h4>
            <select className="formulario-input" {...register("evento", { required: true })}>
              <option value="">Seleccioná un evento</option>
              <option value="cumple">Cumpleaños</option>
              <option value="cancelacion">Cancelación</option>
              <option value="personalizado">Personalizado</option>
            </select>
            {errors.evento && <CampoRequerido />}

            <h4 className="formulario-elemento">Título</h4>
            <input
              className="formulario-input"
              {...register("titulo", { required: true })}
              readOnly={eventoSeleccionado !== "personalizado"}
            />
            {errors.titulo && <CampoRequerido />}

            <h4 className="formulario-elemento">Mensaje</h4>
            <textarea className="formulario-input" {...register("mensaje", { required: true })} />
            {errors.mensaje && <CampoRequerido />}

            <h4 className="formulario-elemento">Fecha</h4>
            <input type="date" className="formulario-input" {...register("fecha", { required: true })} />
            {errors.fecha && <CampoRequerido />}

            <h4 className="formulario-elemento">Hora</h4>
            <input type="time" className="formulario-input" {...register("hora", { required: true })} />
            {errors.hora && <CampoRequerido />}

            <h4 className="formulario-elemento">Enviar a todos los tutores</h4>
            <input type="checkbox" {...register("enviar_a_todos")} />

            <h4 className="formulario-elemento">Para (Salas)</h4>
            <Select
              isMulti
              options={opcionesSalas}
              classNamePrefix="select"
              value={salasSeleccionadas}
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              onChange={(selected) => {
                setSalasSeleccionadas(selected);
                setValue("salas_destinatarias", selected.map((s) => s.value));
              }}
            />

            <h4 className="formulario-elemento">Excluir (Salas)</h4>
            <Select
              isMulti
              options={opcionesSalas}
              classNamePrefix="select"
              value={salasExcluidas}
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              onChange={(selected) => {
                setSalasExcluidas(selected);
                setValue("salas_excluidas", selected.map((s) => s.value));
              }}
            />
          </fieldset>
        </form>

        <div className="botones-grupo">
          {puedeEscribir && !editable && (
            <button onClick={habilitarEdicion} className="boton-editar">Editar</button>
          )}
          {puedeEscribir && editable && (
            <button type="submit" form="editar-notificacion" className="boton-guardar">Guardar</button>
          )}
          {params.id && puedeEscribir && editable && (
            <button onClick={descartarNotificacion} className="boton-eliminar">Eliminar</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificacionesFormPage;
