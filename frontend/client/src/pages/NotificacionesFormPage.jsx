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

function NotificacionesFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm();

  const [editable, setEditable] = useState(false);
  const [salas, setSalas] = useState([]);
  const navigate = useNavigate();
  const params = useParams();
  const pagina = "/notificaciones";
  const puedeEscribir = tienePermiso("notificaciones", "escritura");

  useEffect(() => {
    async function cargarDatos() {
      try {
        const resSalas = await obtenerSalas();
        setSalas(resSalas.data);

        if (params.id) {
          const { data } = await obtenerNotificacion(params.id);
          setValue("titulo", data.titulo);
          setValue("mensaje", data.contenido);
          setValue("fecha_envio", data.fecha_envio || "");
          setValue("hora_envio", data.hora_envio || "");
          setValue("evento", data.evento || "");
          setValue("salas_destinatarias", data.salas_destinatarias || []);
          setValue("salas_excluidas", data.salas_excluidas || []);
          setValue("enviar_a_todos", data.enviar_a_todos || false);
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
        contenido: data.mensaje, // 👈 renombramos para el backend
        salas_destinatarias: Array.from(data.salas_destinatarias || []),
        salas_excluidas: Array.from(data.salas_excluidas || []),
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
            <h4 className="formulario-elemento">Título</h4>
            <input className="formulario-input" {...register("titulo", { required: true })} />
            {errors.titulo && <CampoRequerido />}

            <h4 className="formulario-elemento">Mensaje</h4>
            <textarea className="formulario-input" {...register("mensaje", { required: true })} />
            {errors.mensaje && <CampoRequerido />}

            <h4 className="formulario-elemento">Evento</h4>
            <select className="formulario-input" {...register("evento", { required: true })}>
              <option value="">Seleccioná un evento</option>
              <option value="cumple">Cumpleaños</option>
              <option value="cancelacion">Cancelación</option>
              <option value="personalizado">Personalizado</option>
            </select>
            {errors.evento && <CampoRequerido />}

            <h4 className="formulario-elemento">Fecha</h4>
            <input type="date" className="formulario-input" {...register("fecha_envio", { required: true })} />
            {errors.fecha_envio && <CampoRequerido />}

            <h4 className="formulario-elemento">Hora</h4>
            <input type="time" className="formulario-input" {...register("hora_envio", { required: true })} />
            {errors.hora_envio && <CampoRequerido />}

            <h4 className="formulario-elemento">Enviar a todos los tutores</h4>
            <input type="checkbox" {...register("enviar_a_todos")} />

            <h4 className="formulario-elemento">Para (Salas)</h4>
            <select multiple className="formulario-input" {...register("salas_destinatarias")}> 
              {salas.map((sala) => (
                <option key={sala.id} value={sala.id}>{sala.descripcion}</option>
              ))}
            </select>

            <h4 className="formulario-elemento">Excluir (Salas)</h4>
            <select multiple className="formulario-input" {...register("salas_excluidas")}> 
              {salas.map((sala) => (
                <option key={sala.id} value={sala.id}>{sala.descripcion}</option>
              ))}
            </select>
          </fieldset>
        </form>

        <div className="botones-grupo">
          {puedeEscribir && !editable && (
            <button onClick={habilitarEdicion} className="boton-editar">Editar</button>
          )}
          {puedeEscribir && editable && (
            <button type="submit" form="editar-notificacion" className="boton-guardar">Guardar</button>
          )}
          <br />
          {params.id && puedeEscribir && editable && (
            <button onClick={descartarNotificacion} className="boton-eliminar">Eliminar</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificacionesFormPage;
