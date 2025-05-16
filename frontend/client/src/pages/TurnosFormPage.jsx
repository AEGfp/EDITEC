import { useForm } from "react-hook-form";
import {
  crearTurno,
  eliminarTurno,
  actualizarTurno,
  obtenerTurno,
} from "../api/turnos.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";

function TurnosFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  const [editable, setEditable] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const pagina = "/turnos";

  const puedeEscribir = tienePermiso("turnos", "escritura");

  useEffect(() => {
    async function cargarTurno() {
      try {
        if (params.id) {
          const { data } = await obtenerTurno(params.id);
          setValue("descripcion", data.descripcion);
          setEditable(false);
        } else {
          reset();
          setEditable(true);
        }
      } catch (error) {
        console.error("Error al cargar el turno", error);
      }
    }
    cargarTurno();
  }, [params.id, reset, setValue]);

  const onSubmit = async (data) => {
    try {
      if (params.id) {
        await actualizarTurno(params.id, data);
      } else {
        await crearTurno(data);
      }
      navigate(pagina);
    } catch (error) {
      console.error("Error al guardar el turno", error);
    }
  };

  const habilitarEdicion = () => setEditable(true);

  const descartarTurno = async () => {
    const confirmar = window.confirm("¿Estás seguro que quieres eliminar este turno?");
    if (confirmar) {
      await eliminarTurno(params.id);
      navigate(pagina);
    }
  };

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">Turno</h1>
        <form onSubmit={handleSubmit(onSubmit)} id="editar-turno">
          <fieldset disabled={!editable}>
            <h4 className="formulario-elemento">Descripción</h4>
            <input
              type="text"
              placeholder="Ej: Mañana, Tarde..."
              className="formulario-input"
              {...register("descripcion", { required: true })}
            />
            {errors.descripcion && <CampoRequerido />}
          </fieldset>
        </form>

        <div className="botones-grupo">
          {puedeEscribir && !editable && (
            <button onClick={habilitarEdicion} className="boton-editar">
              Editar
            </button>
          )}
          {puedeEscribir && editable && (
            <button type="submit" form="editar-turno" className="boton-guardar">
              Guardar
            </button>
          )}
          <br />
          {params.id && puedeEscribir && editable && (
            <button onClick={descartarTurno} className="boton-eliminar">
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TurnosFormPage;
