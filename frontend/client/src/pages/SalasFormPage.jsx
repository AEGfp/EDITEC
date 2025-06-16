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

function SalasFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  const [editable, setEditable] = useState(false);
  const [profesores, setProfesores] = useState([]);
  const navigate = useNavigate();
  const params = useParams();
  const pagina = "/salas";

  useEffect(() => {
    async function cargarFormulario() {
      try {
        const { data: profesoresData } = await obtenerFuncionarios({ grupo: "profesor" });
  
        if (params.id) {
          const { data } = await obtenerSala(params.id);
  
          // Agregar el profesor transferido si no está
          if (
            data.profesor_encargado &&
            !profesoresData.some(p => p.persona?.id === (data.profesor_encargado?.id || data.profesor_encargado))
          ) {
            profesoresData.push({
              persona: data.profesor_encargado_obj || data.profesor_encargado,
              groups: [],
            });
          }
  
          setProfesores(profesoresData);
          setValue("descripcion", data.descripcion);
          setValue("profesor_encargado", data.profesor_encargado?.id || data.profesor_encargado);
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
