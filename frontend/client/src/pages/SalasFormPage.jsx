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
      const [horas, minutos] = horaEntrada.split(":").map(Number);
      const entradaDate = new Date(0, 0, 0, horas, minutos);

      entradaDate.setHours(entradaDate.getHours() + 5);

      const limiteSalida = new Date(0, 0, 0, 16, 0);
      if (entradaDate > limiteSalida) {
        entradaDate.setHours(16);
        entradaDate.setMinutes(0);
      }

      const salidaHora = entradaDate.getHours().toString().padStart(2, "0");
      const salidaMin = entradaDate.getMinutes().toString().padStart(2, "0");
      const horaSalidaFormateada = `${salidaHora}:${salidaMin}`;

      setValue("hora_salida", horaSalidaFormateada, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [horaEntrada, setValue]);

  useEffect(() => {
    async function cargarFormulario() {
      try {
        const { data: profesoresData } = await obtenerFuncionarios({
          grupo: "profesor",
        });

        if (params.id) {
          const { data } = await obtenerSala(params.id);

          // Agregar el profesor transferido si no está
          if (
            data.profesor_encargado &&
            !profesoresData.some(
              (p) =>
                p.persona?.id ===
                (data.profesor_encargado?.id || data.profesor_encargado)
            )
          ) {
            profesoresData.push({
              persona: data.profesor_encargado_obj || data.profesor_encargado,
              groups: [],
            });
          }

          setProfesores(profesoresData);
          setValue("descripcion", data.descripcion);
          setValue(
            "profesor_encargado",
            data.profesor_encargado?.id || data.profesor_encargado
          );
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
    const confirmar = window.confirm(
      "¿Estás seguro que quieres eliminar esta sala?"
    );
    if (confirmar) {
      await eliminarSala(params.id);
      navigate(pagina);
    }
  };

  const puedeEscribir = tienePermiso("salas", "escritura");

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">Sala</h1>
        <form onSubmit={handleSubmit(onSubmit)} id="editar-sala">
          <fieldset disabled={!editable}>
            <h4 className="formulario-elemento">Descripción</h4>
            <input
              type="text"
              placeholder="Ingrese una descripción..."
              className="formulario-input"
              {...register("descripcion", { required: true })}
            />
            {errors.descripcion && <CampoRequerido />}

            <h4 className="formulario-elemento">Profesor encargado</h4>
            <select
              {...register("profesor_encargado", { required: true })}
              className="formulario-input"
            >
              <option value="">Seleccione un profesor</option>
              {profesores.map((prof) => (
                <option key={prof.persona?.id} value={prof.persona?.id}>
                  {prof.persona?.nombre} {prof.persona?.apellido}
                </option>
              ))}
            </select>
            {errors.profesor_encargado && <CampoRequerido />}

            <h4 className="formulario-elemento">Hora de entrada</h4>
            <input
              type="time"
              className="formulario-input"
              {...register("hora_entrada", {
                required: true,
                validate: (value) => {
                  const hora = value.split(":");
                  const horaNum = parseInt(hora[0], 10);
                  if (horaNum < 7)
                    return "La hora de entrada no puede ser antes de las 07:00";
                  if (horaNum >= 15)
                    return "La hora de entrada debe ser antes de las 15:00";
                  return true;
                },
              })}
            />
            {errors.hora_entrada && (
              <MostrarError
                errores={errors.hora_entrada.message}
              ></MostrarError>
            )}

            <h4 className="formulario-elemento">Hora de salida</h4>
            <input
              type="time"
              className="formulario-input"
              {...register("hora_salida", {
                required: true,
                validate: (value) => {
                  const hora = value.split(":");
                  const horaNum = parseInt(hora[0], 10);
                  const horaEntrada = watch("hora_entrada");
                  if (horaEntrada) {
                    if (value <= horaEntrada)
                      return "La hora de salida debe ser posterior a la hora de entrada";
                    const diffHoras =
                      parseInt(value.split(":")[0]) +
                      parseInt(value.split(":")[1]) / 60 -
                      (parseInt(horaEntrada.split(":")[0]) +
                        parseInt(horaEntrada.split(":")[1]) / 60);
                    if (diffHoras > 5)
                      return "La diferencia entre hora de entrada y salida no puede ser mayor a 5 horas";
                  }
                  if (
                    horaNum > 17 ||
                    (horaNum === 17 && value.split(":")[1] !== "00")
                  )
                    return "La hora de salida no puede ser mayor a las 17:00";
                  return true;
                },
              })}
            />
            {errors.hora_salida && (
              <MostrarError errores={errors.hora_salida.message}></MostrarError>
            )}

            <h4 className="formulario-elemento">Límite de infantes</h4>
            <input
              type="number"
              className="formulario-input"
              min={1}
              max={20}
              {...register("limite_infantes", {
                required: true,
                min: { value: 1, message: "El límite debe ser al menos 1" },
                max: {
                  value: 20,
                  message: "El límite no puede ser mayor a 20",
                },
              })}
            />
            {errors.limite_infantes && (
              <MostrarError
                errores={errors.limite_infantes.message}
              ></MostrarError>
            )}

            <h4 className="formulario-elemento">Edad máxima en meses</h4>
            <select
              className="formulario-input"
              {...register("meses", { required: true })}
            >
              <option value="">Seleccione una opción</option>
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="48">48</option>
            </select>
            {errors.meses && (
              <MostrarError errores={errors.meses.message}></MostrarError>
            )}
          </fieldset>
        </form>
        <br />
        <div className="botones-grupo">
          {puedeEscribir && !editable && (
            <button onClick={habilitarEdicion} className="boton-editar">
              Editar
            </button>
          )}
          {puedeEscribir && editable && (
            <button type="submit" form="editar-sala" className="boton-guardar">
              Guardar
            </button>
          )}
          {params.id && puedeEscribir && editable && (
            <button onClick={descartarSala} className="boton-eliminar">
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SalasFormPage;
