import { useForm } from "react-hook-form";
import {
  crearInfante,
  actualizarInfante,
  eliminarInfante,
  obtenerInfante,
} from "../api/infantes.api";
import {
  crearPersona,
  actualizarPersona,
} from "../api/personas.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";

function InfantesFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm();

  const [editable, setEditable] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const pagina = "/infantes";
  const puedeEscribir = tienePermiso("infantes", "escritura");

  useEffect(() => {
    async function cargarInfante() {
      try {
        if (params.id) {
          const { data } = await obtenerInfante(params.id);
          console.log("🧾 Datos recibidos del backend:", data); 
          console.log("🧾 Persona recibida:", data.id_persona);
          const persona = data.id_persona || {};
          const personaId = typeof persona === "object" ? persona.id : persona;

          setValue("id_persona", personaId);
          setValue("nombre", persona.nombre || "");
          setValue("apellido", persona.apellido || "");
          setValue("ci", persona.ci || "");

          setValue("ind_alergia", data.ind_alergia);
          setValue("ind_intolerancia_lactosa", data.ind_intolerancia_lactosa);
          setValue("ind_celiaquismo", data.ind_celiaquismo);
          setValue("permiso_cambio_panhal", data.permiso_cambio_panhal);
          setValue("permiso_fotos", data.permiso_fotos);

          setEditable(false);
        } else {
          reset({
            ind_alergia: "N",
            ind_intolerancia_lactosa: "N",
            ind_celiaquismo: "N",
            permiso_cambio_panhal: "N",
            permiso_fotos: "N",
          });
          setEditable(true);
        }
      } catch (error) {
        console.error("Error al cargar el infante", error);
      }
    }

    cargarInfante();
  }, [params.id, reset, setValue]);

  const onSubmit = async (data) => {
    try {
      const idPersona = data.id_persona || watch("id_persona");
      console.log("🧠 ID persona al enviar:", idPersona);

      if (params.id) {
        await actualizarPersona(idPersona, {
          nombre: data.nombre,
          apellido: data.apellido,
          ci: data.ci,
        });

        await actualizarInfante(params.id, {
          id_persona: idPersona, // 👈 NECESARIO
          ind_alergia: data.ind_alergia,
          ind_intolerancia_lactosa: data.ind_intolerancia_lactosa,
          ind_celiaquismo: data.ind_celiaquismo,
          permiso_cambio_panhal: data.permiso_cambio_panhal,
          permiso_fotos: data.permiso_fotos,
        });

        navigate(pagina);
        return;
      }

      const resPersona = await crearPersona({
        nombre: data.nombre,
        apellido: data.apellido,
        ci: data.ci,
      });
      
      console.log("👤 Persona creada:", resPersona.data); 

    if (!resPersona.data.id) {
      throw new Error("❌ La respuesta no contiene un ID");
    }
      await crearInfante({
        id_persona: resPersona.data.id,
        ind_alergia: data.ind_alergia,
        ind_intolerancia_lactosa: data.ind_intolerancia_lactosa,
        ind_celiaquismo: data.ind_celiaquismo,
        permiso_cambio_panhal: data.permiso_cambio_panhal,
        permiso_fotos: data.permiso_fotos,
      });

      navigate(pagina);
    } catch (error) {
      console.error("Error al guardar el infante", error);
    }
  };

  const habilitarEdicion = () => setEditable(true);

  const descartarInfante = async () => {
    const confirmar = window.confirm("¿Estás seguro que quieres eliminar este infante?");
    if (confirmar) {
      await eliminarInfante(params.id);
      navigate(pagina);
    }
  };

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">Infante</h1>
        <form onSubmit={handleSubmit(onSubmit)} id="editar-infante">
          <input type="hidden" {...register("id_persona")} />

          <fieldset disabled={!editable}>
            <h4 className="formulario-elemento">Nombre</h4>
            <input className="formulario-input" {...register("nombre", { required: true })} />
            {errors.nombre && <CampoRequerido />}

            <h4 className="formulario-elemento">Apellido</h4>
            <input className="formulario-input" {...register("apellido", { required: true })} />
            {errors.apellido && <CampoRequerido />}

            <h4 className="formulario-elemento">CI</h4>
            <input className="formulario-input" {...register("ci", { required: true })} />
            {errors.ci && <CampoRequerido />}

            <h4 className="formulario-elemento">¿Alergia?</h4>
            <select className="formulario-input" {...register("ind_alergia")}>
              <option value="N">No</option>
              <option value="S">Sí</option>
            </select>

            <h4 className="formulario-elemento">¿Intolerancia a la lactosa?</h4>
            <select className="formulario-input" {...register("ind_intolerancia_lactosa")}>
              <option value="N">No</option>
              <option value="S">Sí</option>
            </select>

            <h4 className="formulario-elemento">¿Celiaquismo?</h4>
            <select className="formulario-input" {...register("ind_celiaquismo")}>
              <option value="N">No</option>
              <option value="S">Sí</option>
            </select>

            <h4 className="formulario-elemento">¿Permiso para cambiar pañal?</h4>
            <select className="formulario-input" {...register("permiso_cambio_panhal")}>
              <option value="N">No</option>
              <option value="S">Sí</option>
            </select>

            <h4 className="formulario-elemento">¿Permiso para fotos?</h4>
            <select className="formulario-input" {...register("permiso_fotos")}>
              <option value="N">No</option>
              <option value="S">Sí</option>
            </select>
          </fieldset>
        </form>

        <div className="botones-grupo">
          {puedeEscribir && !editable && (
            <button onClick={habilitarEdicion} className="boton-editar">Editar</button>
          )}
          {puedeEscribir && editable && (
            <button type="submit" form="editar-infante" className="boton-guardar">Guardar</button>
          )}
          <br />
          {params.id && puedeEscribir && editable && (
            <button onClick={descartarInfante} className="boton-eliminar">Eliminar</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default InfantesFormPage;
