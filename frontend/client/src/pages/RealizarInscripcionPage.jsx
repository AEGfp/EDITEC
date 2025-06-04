import { useState } from "react";
import { useForm } from "react-hook-form";
import CamposUsuario from "../components/CamposUsuario";
import CamposTutor from "../components/CamposTutor";
import CamposInfante from "../components/CamposInfante";
import { useNavigate, useLocation } from "react-router-dom";
import {
  crearInscripcion,
  crearInscripcionExistente,
} from "../api/inscripciones.api";

export default function RealizarInscripcionPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const location = useLocation();
  const omitirUsuario = location.state?.omitirUsuario || false;

  const [pestanha, setPestanha] = useState(0);
  const [formulario, setFormulario] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const siguiente = () => setPestanha((prev) => prev + 1);
  const previo = () => setPestanha((prev) => prev - 1);

  const pasos = [];
  if (!omitirUsuario)
    pasos.push(
      <CamposUsuario register={register} errors={errors} watch={watch} />
    );
  pasos.push(<CamposTutor register={register} errors={errors} />);
  pasos.push(<CamposInfante register={register} errors={errors} />);
  // 4: <ArchivosForm register={register} errors={errors} />,
  // 5: <ConfirmarInscripcion idTutor={idTutor} idInfante={idInfante} />,

  const guardarDatos = async (data) => {
    const datosActualizados = { ...formulario, ...data };
    setFormulario(datosActualizados);

    if (pestanha < pasos.length - 1) {
      siguiente();
    } else {
      await realizarInscripcion(datosActualizados);
    }
  };

  const realizarInscripcion = async (datos) => {
    setError("");
    setLoading(true);
    let res;
    try {
      const inscripcion = {
        tutor_data: {
          es_docente: datos.es_docente,
          es_estudiante: datos.es_estudiante,
          es_funcionario: datos.es_funcionario,
          telefono_casa: datos.telefono_casa,
          telefono_particular: datos.telefono_particular,
          telefono_trabajo: datos.telefono_trabajo,
          nombre_empresa_trabajo: datos.nombre_empresa_trabajo,
          direccion_trabajo: datos.direccion_trabajo,
          observaciones: datos.observaciones,
        },
        persona_data_infante: {
          nombre: datos.infante_nombre,
          apellido: datos.infante_apellido,
          segundo_apellido: datos.infante_segundo_apellido,
          fecha_nacimiento: datos.infante_fecha_nacimiento,
          sexo: datos.infante_sexo,
          ci: datos.infante_ci,
          domicilio: datos.infante_domicilio,
        },
        infante_data: {
          ind_alergia: datos.ind_alergia,
          ind_intolerancia_lactosa: datos.ind_intolerancia_lactosa,
          ind_celiaquismo: datos.ind_celiaquismo,
          permiso_cambio_panhal: datos.permiso_cambio_panhal,
          permiso_fotos: datos.permiso_fotos,
        },
      };

      if (!omitirUsuario) {
        inscripcion.user_data_tutor = {
          username: datos.username,
          password: datos.password,
          email: datos.email,
          persona: {
            nombre: datos.nombre,
            apellido: datos.apellido,
            segundo_apellido: datos.segundo_apellido,
            fecha_nacimiento: datos.fecha_nacimiento,
            sexo: datos.sexo,
            ci: datos.ci,
            domicilio: datos.domicilio,
          },
        };

        console.log(JSON.stringify(inscripcion, null, 2));
        res = await crearInscripcion(inscripcion);
      } else {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        const idUsuario = usuario?.id;
        inscripcion.user_id = idUsuario;

        console.log(JSON.stringify(inscripcion, null, 2));
        res = await crearInscripcionExistente(inscripcion);
      }

      if (res.status == 201) {
        alert("¡Inscripción completada con éxito!");
        navigate("/home");
      } else {
        throw new Error("Error al crear la inscripción");
      }
    } catch (err) {
      console.error(err);
      setError("Ha ocurrido un error al completar la inscripción");
      setPestanha(0);
      setFormulario({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(guardarDatos)} className="formulario">
      <div className="formulario-dentro md:max-w-4xl">
        {pasos[pestanha]}

        <div className="botones-grupo mt-4">
          {pestanha > 0 && (
            <button type="button" onClick={previo} className="boton-editar">
              Volver
            </button>
          )}
          <button type="submit" className="boton-guardar">
            {loading
              ? "Procesando inscripcion"
              : pestanha === pasos.length - 1
              ? "Finalizar inscripción"
              : "Siguiente"}
          </button>
        </div>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
    </form>
  );
}
