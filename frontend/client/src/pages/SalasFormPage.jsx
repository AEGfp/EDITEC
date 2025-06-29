import { useForm } from "react-hook-form";
import {
  crearSala,
  eliminarSala,
  actualizarSala,
  obtenerSala,
} from "../api/salas.api";
import { obtenerFuncionarios } from "../api/funcionarios.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";
import MostrarError from "../components/MostrarError";

function SalasFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm();

  const [editable, setEditable] = useState(false);
  const [profesores, setProfesores] = useState([]);
  const navigate = useNavigate();
  const params = useParams();
  const pagina = "/salas";
  const horaEntrada = watch("hora_entrada");

  useEffect(() => {
    if (horaEntrada) {
      const [horas, minutos] = horaEntrada.split(":" ).map(Number);
      const entradaDate = new Date(0, 0, 0, horas, minutos);
      entradaDate.setHours(entradaDate.getHours() + 5);
      const limiteSalida = new Date(0, 0, 0, 16, 0);
      if (entradaDate > limiteSalida) {
        entradaDate.setHours(16);
        entradaDate.setMinutes(0);
      }
      const salidaHora = entradaDate.getHours().toString().padStart(2, "0");
      const salidaMin = entradaDate.getMinutes().toString().padStart(2, "0");
      setValue("hora_salida", `${salidaHora}:${salidaMin}`, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [horaEntrada, setValue]);

  useEffect(() => {
    async function cargarFormulario() {
      try {
        const { data: profesoresData } = await obtenerFuncionarios({ grupo: "profesor" });
        if (params.id) {
          const { data } = await obtenerSala(params.id);
          if (
            data.profesor_encargado &&
            !profesoresData.some(
              (p) => p.persona?.id === (data.profesor_encargado?.id || data.profesor_encargado)
            )
          ) {
            profesoresData.push({
              persona: data.profesor_encargado_obj || data.profesor_encargado,
              groups: [],
            });
          }
          setProfesores(profesoresData);
          setValue("descripcion", data.descripcion);
          setValue("profesor_encargado", data.profesor_encargado?.id || data.profesor_encargado);
          setValue("hora_entrada", data.hora_entrada || "");
          setValue("hora_salida", data.hora_salida || "");
          setValue("limite_infantes", data.limite_infantes ?? 1);
          setValue("meses", data.meses ?? 0);
          setEditable(false);
        } else {
          setProfesores(profesoresData);
          reset();
          setEditable(true);
        }
      } catch (error) {
        console.error("Error al cargar sala o profesores", error);
      }
    }
    cargarFormulario();
  }, [params.id, reset, setValue]);

  const onSubmit = async (data) => {
    try {
      if (params.id) {
        await actualizarSala(params.id, data);
      } else {
        await crearSala(data);
      }
      navigate(pagina);
    } catch (error) {
      console.error("Error al guardar la sala", error);
    }
  };

  const habilitarEdicion = () => setEditable(true);
  const descartarSala = async () => {
    const confirmar = window.confirm("¿Estás seguro que quieres eliminar esta sala?");
    if (confirmar) {
      await eliminarSala(params.id);
      navigate(pagina);
    }
  };

  const puedeEscribir = tienePermiso("salas", "escritura");

  return (
    <div className="min-h-screen bg-blue-50 flex justify-center items-center py-10">
      <div className="bg-white rounded-xl shadow-md w-full max-w-xl p-6">
        <div className="bg-blue-100 rounded-md px-4 py-2 mb-6 text-center">
          <h2 className="text-lg font-bold text-blue-700 flex items-center justify-center gap-2">
            🏫 {params.id ? "Editar Sala" : "Nueva Sala"}
          </h2>
        </div>
  
        <form onSubmit={handleSubmit(onSubmit)} id="editar-sala" className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Descripción</label>
            <input
              type="text"
              className="formulario-input"
              placeholder="Ingrese una descripción..."
              {...register("descripcion", { required: true })}
              disabled={!editable}
            />
            {errors.descripcion && <CampoRequerido />}
          </div>
  
          <div>
            <label className="block mb-1 font-medium">Profesor encargado</label>
            <select
              className="formulario-input"
              {...register("profesor_encargado", { required: true })}
              disabled={!editable}
            >
              <option value="">Seleccione un profesor</option>
              {profesores.map((prof) => (
                <option key={prof.persona?.id} value={prof.persona?.id}>
                  {prof.persona?.nombre} {prof.persona?.apellido}
                </option>
              ))}
            </select>
            {errors.profesor_encargado && <CampoRequerido />}
          </div>
  
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Hora de entrada</label>
              <input
                type="time"
                className="formulario-input"
                {...register("hora_entrada", { required: true })}
                disabled={!editable}
              />
              {errors.hora_entrada && <MostrarError errores={errors.hora_entrada.message} />}
            </div>
            <div>
              <label className="block mb-1 font-medium">Hora de salida</label>
              <input
                type="time"
                className="formulario-input"
                {...register("hora_salida", { required: true })}
                disabled={!editable}
              />
              {errors.hora_salida && <MostrarError errores={errors.hora_salida.message} />}
            </div>
          </div>
  
          <div>
            <label className="block mb-1 font-medium">Límite de infantes</label>
            <input
              type="number"
              className="formulario-input"
              min={1}
              max={20}
              {...register("limite_infantes", { required: true })}
              disabled={!editable}
            />
            {errors.limite_infantes && <MostrarError errores={errors.limite_infantes.message} />}
          </div>
  
          <div>
            <label className="block mb-1 font-medium">Edad máxima en meses</label>
            <select
              className="formulario-input"
              {...register("meses", { required: true })}
              disabled={!editable}
            >
              <option value="">Seleccione una opción</option>
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="48">48</option>
            </select>
            {errors.meses && <MostrarError errores={errors.meses.message} />}
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
                  <button type="button" onClick={descartarSala} className="boton-eliminar">
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
export default SalasFormPage;
