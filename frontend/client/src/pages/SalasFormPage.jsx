import { useForm } from "react-hook-form";
import {
  crearSala,
  eliminarSala,
  actualizarSala,
  obtenerSala,
} from "../api/salas.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";

function SalasFormPage() {
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
  const pagina = "/salas";

  useEffect(() => {
    async function cargarSala() {
      try {
        if (params.id) {
          const { data } = await obtenerSala(params.id);
          setValue("descripcion", data.descripcion);
          setEditable(false);
        } else {
          reset();
          setEditable(true);
        }
      } catch (error) {
        console.error("Error al cargar la sala", error);
      }
    }
    cargarSala();
  }, [params.id, reset, setValue]);

  const onSubmit = async (data) => {
    try {
      if (params.id) {
        await actualizarSala(params.id, data);
      } else {
        await crearSala(data); // el backend debería setear id_usuario_aud automáticamente
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
          </fieldset>
        </form>

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
          <br />
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
