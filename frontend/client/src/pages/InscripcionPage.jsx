import { useState } from "react";
import { useForm } from "react-hook-form";
import CamposUsuario from "../components/CamposUsuario";
import CamposTutor from "../components/CamposTutor";
import CamposInfante from "../components/CamposInfante";
import { signUpApi } from "../api/signup.api";
import { loginUsuario } from "../utils/loginUsuario";
import { crearTutor } from "../api/tutores.api";
import { useEffect } from "react";
import { crearInfante } from "../api/infantes.api";
import { crearPersona } from "../api/personas.api";

export default function InscripcionPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [pestanha, setPestanha] = useState(1);
  const [idPersona, setIdPersona] = useState(null);
  const [idTutor, setIdTutor] = useState(null);
  const [idInfante, setIdInfante] = useState(null);
  const [error, setError] = useState("");

  const siguiente = () => setPestanha(pestanha + 1);
  const previo = () => setPestanha(pestanha - 1);

  useEffect(() => {
    const personaLocal = localStorage.getItem("idPersona");
    const tutorLocal = localStorage.getItem("idTutor");
    const infanteLocal = localStorage.getItem("idInfante");

    if (personaLocal && !idPersona) {
      setIdPersona(Number(personaLocal));
    }

    if (tutorLocal && !idTutor) {
      setIdTutor(Number(tutorLocal));
    }

    if (infanteLocal && !idInfante) {
      setIdInfante(Number(infanteLocal));
    }
  }, [idPersona, idTutor, idInfante]);

  const pasos = {
    1: <CamposUsuario register={register} errors={errors} />,
    2: <CamposTutor register={register} errors={errors} />,
    3: <CamposInfante register={register} errors={errors} />,
    // 4: <ArchivosForm register={register} errors={errors} />,
    // 5: <ConfirmarInscripcion idTutor={idTutor} idInfante={idInfante} />,
  };

  const realizarInscripcion = async (data) => {
    setError("");
    try {
      switch (pestanha) {
        case 1:
          const campos = {
            username: data.username,
            password: data.password,
            groups: ["tutor"],
            persona: {
              nombre: data.nombre,
              apellido: data.apellido,
              segundo_apellido: data.segundo_apellido,
              fecha_nacimiento: data.fecha_nacimiento,
              sexo: data.sexo,
              ci: data.ci,
              domicilio: data.domicilio,
            },
          };

          try {
            const res = await signUpApi(campos);
            if (res.status === 201 && res.data.user?.persona?.id) {
              setIdPersona(res.data.user.persona.id);
              localStorage.setItem("idPersona", idPersona);

              await loginUsuario({
                username: data.username,
                password: data.password,
                setError,
              });
              siguiente();
            }
          } catch (err) {
            console.error("Error en el registro:", err);
            if (err.response?.data) {
              setError(JSON.stringify(err.response.data));
            } else {
              setError("Ocurrió un error inesperado.");
            }
          }

          break;

        case 2:
          try {
            if (!idPersona) {
              setError("No se encontró la persona asociada al tutor.");
              setPestanha(1);
              break;
            }

            const tutorData = {
              id_persona: idPersona,
              es_docente: data.es_docente || false,
              es_estudiante: data.es_estudiante || false,
              es_funcionario: data.es_funcionario || false,
              telefono_casa: data.telefono_casa,
              telefono_particular: data.telefono_particular,
              telefono_trabajo: data.telefono_trabajo,
              nombre_empresa_trabajo: data.nombre_empresa_trabajo,
              direccion_trabajo: data.direccion_trabajo,
              observaciones: data.observaciones,
            };

            const res = await crearTutor(tutorData);

            if (res.status === 201 || res.status === 200) {
              setIdTutor(res.data.id);
              localStorage.setItem("idTutor", idTutor);
              siguiente();
            } else {
              setError("Error al crear el tutor.");
            }
          } catch (err) {
            console.error("Error al guardar tutor:", err);
            if (err.response?.data) {
              setError(JSON.stringify(err.response.data));
            } else {
              setError("Ocurrió un error inesperado.");
            }
          }

          break;

        case 3:
          try {
            const personaInfante = {
              nombre: data.infante_nombre,
              apellido: data.infante_apellido,
              segundo_apellido: data.infante_segundo_apellido,
              fecha_nacimiento: data.infante_fecha_nacimiento,
              sexo: data.infante_sexo,
              ci: data.infante_ci,
              domicilio: data.infante_domicilio,
            };

            const resPersona = await crearPersona(personaInfante);
            const personaInfanteId = resPersona.data.id;

            const infanteData = {
              id_persona: personaInfanteId,
              ind_alergia: data.ind_alergia,
              ind_intolerancia_lactosa: data.ind_intolerancia_lactosa,
              ind_celiaquismo: data.ind_celiaquismo,
              permiso_cambio_panhal: data.permiso_cambio_panhal,
              permiso_fotos: data.permiso_fotos,
            };

            const resInfante = await crearInfante(infanteData);

            if (resInfante.status === 201 || resInfante.status === 200) {
              setIdInfante(resInfante.data.id);
              localStorage.setItem("idInfante", idInfante);
              siguiente();
            } else {
              setError("Error al crear el infante.");
            }
          } catch (err) {
            console.error("Error al guardar infante:", err);
            setError("Ocurrió un error al guardar el infante.");
          }
          break;
        case 4:
          siguiente();
          break;
        case 5:
          localStorage.removeItem("idPersona");
          localStorage.removeItem("idTutor");
          localStorage.removeItem("idInfante");
          reset();
          break;
      }
    } catch (err) {
      setError("Ocurrió un error al procesar los datos.");
      console.error(e);
    }
  };

  return (
    <form onSubmit={handleSubmit(realizarInscripcion)} className="formulario">
      {pasos[pestanha]}

      <div className="botones-grupo mt-4">
        {pestanha > 1 && (
          <button type="button" onClick={previo} className="boton-editar">
            Volver
          </button>
        )}
        <button type="submit" className="boton-guardar">
          {pestanha === Object.keys(pasos).length
            ? "Finalizar inscripción"
            : "Siguiente"}
        </button>
      </div>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </form>
  );
}
