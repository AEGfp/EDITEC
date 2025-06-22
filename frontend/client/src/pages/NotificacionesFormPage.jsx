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
  const enviarATodos = watch("enviar_a_todos");

  const [editable, setEditable] = useState(false);
  const [salas, setSalas] = useState([]);
  const [salasSeleccionadas, setSalasSeleccionadas] = useState([]);
  const [salasExcluidas, setSalasExcluidas] = useState([]);
  const [erroresBackend, setErroresBackend] = useState({});

  const navigate = useNavigate();
  const params = useParams();
  const pagina = "/notificaciones";
  const puedeEscribir = tienePermiso("notificaciones", "escritura");

  const opcionesSalas = salas.map((s) => ({ value: s.id, label: s.descripcion }));

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
          setValue("fecha", data.fecha || "");
          setValue("hora", data.hora || "");
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
          setValue("salas_destinatarias", seleccionadas.map((s) => Number(s.value)));
          setValue("salas_excluidas", excluidas.map((s) => Number(s.value)));

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
      setErroresBackend({}); // Limpia errores anteriores
  
      const destinatarias = Array.isArray(salasSeleccionadas)
        ? salasSeleccionadas.map((s) => Number(s.value))
        : [];
  
      const excluidas = Array.isArray(salasExcluidas)
        ? salasExcluidas.map((s) => Number(s.value))
        : [];
  
      if (!data.enviar_a_todos && destinatarias.length === 0 && excluidas.length === 0) {
        setErroresBackend({
          salas_destinatarias: ["Debe seleccionar al menos una sala destinataria o excluir alguna sala."],
        });
        return;
      }
  
      const payload = {
        ...data,
        contenido: data.mensaje,
        fecha: data.fecha,
        hora: data.hora,
        salas_destinatarias: destinatarias,
        salas_excluidas: excluidas,
        enviar_a_todos: data.enviar_a_todos || false,
      };
  
      if (params.id) {
        await actualizarNotificacion(params.id, payload);
      } else {
        console.log("Payload enviado:", payload);
        await crearNotificacion(payload);
      }
  
      navigate(pagina);
    } catch (error) {
      console.error("Error al guardar la notificación", error);
      if (error.response && error.response.data) {
        setErroresBackend(error.response.data);
      }
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
            <input
              type="date"
              className="formulario-input"
              {...register("fecha", {
                required: "La fecha es obligatoria.",
                validate: (value) => {
                  const hoy = new Date();
                  const seleccionada = new Date(value);
                  // Normalizar ambos a medianoche para evitar errores por hora
                  hoy.setHours(0, 0, 0, 0);
                  seleccionada.setHours(0, 0, 0, 0);
                  return seleccionada >= hoy || "Ingrese una fecha válida igual o superior a la actual.";
                },
              })}
            />
            {errors.fecha && <p className="text-red-500 text-sm">{errors.fecha.message}</p>}
            {erroresBackend.fecha && <p className="text-red-500 text-sm">{erroresBackend.fecha[0]}</p>}

            <h4 className="formulario-elemento">Hora</h4>
            <input
              type="time"
              className="formulario-input"
              {...register("hora", { required: true })}
            />
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
                setValue("salas_destinatarias", selected.map((s) => Number(s.value)));
              }}
            />
            {erroresBackend.salas_destinatarias && (
              <p className="text-red-500 text-sm">{erroresBackend.salas_destinatarias[0]}</p>
            )}

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
                setValue("salas_excluidas", selected.map((s) => Number(s.value)));
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
