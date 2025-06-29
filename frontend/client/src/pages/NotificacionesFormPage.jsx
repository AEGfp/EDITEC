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
      setErroresBackend({});

      const destinatarias = salasSeleccionadas.map((s) => Number(s.value));
      const excluidas = salasExcluidas.map((s) => Number(s.value));

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

  const handleEditar = () => setEditable(true);

  const handleEliminar = async () => {
    if (confirm("¿Seguro que desea eliminar esta notificación?")) {
      try {
        await eliminarNotificacion(params.id);
        navigate(pagina);
      } catch (error) {
        console.error("Error al eliminar", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6">
      <h1 className="text-lg font-semibold text-center text-blue-800 bg-blue-100 py-2 rounded-md mb-4">
  {params.id
    ? editable
      ? "📝 Editar Notificación"  
      : "🔔 Detalles de Notificación"  // Campana de notificación
    : "➕ Nueva Notificación"}  
</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="font-semibold">Evento</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              {...register("evento", { required: true })}
              disabled={!editable}
            >
              <option value="">Seleccioná un evento</option>
              <option value="cumple">Cumpleaños</option>
              <option value="cancelacion">Cancelación</option>
              <option value="personalizado">Personalizado</option>
            </select>
            {errors.evento && <CampoRequerido />}
          </div>

          <div>
            <label className="font-semibold">Título</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2"
              {...register("titulo", { required: true })}
              readOnly={!editable || eventoSeleccionado !== "personalizado"}
            />
            {errors.titulo && <CampoRequerido />}
          </div>

          <div>
            <label className="font-semibold">Mensaje</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2"
              {...register("mensaje", { required: true })}
              readOnly={!editable}
            />
            {errors.mensaje && <CampoRequerido />}
          </div>

          <div>
            <label className="font-semibold">Fecha</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2"
              {...register("fecha", {
                required: "La fecha es obligatoria.",
                validate: (value) => {
                  const hoy = new Date();
                  hoy.setHours(0, 0, 0, 0);
                  const [a, m, d] = value.split("-").map(Number);
                  const seleccionada = new Date(a, m - 1, d);
                  return seleccionada >= hoy || "Ingrese una fecha válida igual o superior a la actual.";
                },
              })}
              disabled={!editable}
            />
            {errors.fecha && <p className="text-red-500 text-sm">{errors.fecha.message}</p>}
            {erroresBackend.fecha && <p className="text-red-500 text-sm">{erroresBackend.fecha[0]}</p>}
          </div>

          <div>
            <label className="font-semibold">Hora</label>
            <input
              type="time"
              className="w-full border border-gray-300 rounded px-3 py-2"
              {...register("hora", { required: true })}
              disabled={!editable}
            />
            {errors.hora && <CampoRequerido />}
          </div>

          <div>
            <label className="font-semibold">Enviar a todos los tutores</label>
            <input type="checkbox" className="ml-2" {...register("enviar_a_todos")} disabled={!editable} />
          </div>

          <div>
            <label className="font-semibold">Para (Salas)</label>
            <Select
              isMulti
              isDisabled={!editable}
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
          </div>

          <div>
            <label className="font-semibold">Excluir (Salas)</label>
            <Select
              isMulti
              isDisabled={!editable}
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
          </div>

          {puedeEscribir && (
            <div className="pt-4 border-t mt-4">
              {!editable && params.id && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleEditar}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-5 rounded"
                  >
                    ✏️ Editar
                  </button>
                </div>
              )}

              {editable && (
                <div className="flex justify-center space-x-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-5 rounded"
                  >
                    💾 Guardar
                  </button>

                  {params.id && (
                    <button
                      type="button"
                      onClick={handleEliminar}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-5 rounded"
                    >
                      🗑️ Eliminar
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default NotificacionesFormPage;
