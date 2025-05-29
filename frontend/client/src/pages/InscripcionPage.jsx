import { useState } from "react";
import { useForm } from "react-hook-form";
import CamposUsuario from "../components/CamposUsuario";
import CamposTutor from "../components/CamposTutor";
import CamposInfante from "../components/CamposInfante";
import { signUpApi } from "../api/signup.api";
import { loginUsuario } from "../utils/loginUsuario";
import { crearTutor } from "../api/tutores.api";
import { crearInfante } from "../api/infantes.api";
import { crearPersona } from "../api/personas.api";
import { useNavigate } from "react-router-dom";
import { crearInscripcion } from "../api/inscripciones.api";

export default function InscripcionPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const [pestanha, setPestanha] = useState(1);
  const [formulario, setFormulario] = useState({});
  const [error, setError] = useState("");
  const [idPersona, setIdPersona] = useState(null);
  const [idPersonaInfante, setIdPersonaInfante] = useState(null);
  const [idTutor, setIdTutor] = useState(null);
  const [idInfante, setIdInfante] = useState(null);

  const navigate = useNavigate();

  const siguiente = () => setPestanha(pestanha + 1);
  const previo = () => setPestanha(pestanha - 1);

  const pasos = {
    1: <CamposUsuario register={register} errors={errors} watch={watch} />,
    2: <CamposTutor register={register} errors={errors} />,
    3: <CamposInfante register={register} errors={errors} />,
    // 4: <ArchivosForm register={register} errors={errors} />,
    // 5: <ConfirmarInscripcion idTutor={idTutor} idInfante={idInfante} />,
  };

  const guardarDatos = async (data) => {
    const datosActualizados = { ...formulario, ...data };
    setFormulario(datosActualizados);

    if (pestanha < Object.keys(pasos).length) {
      siguiente();
    } else {
      await realizarInscripcion(datosActualizados);
    }
  };

  const realizarInscripcion = async (data) => {
    setError("");

    if (data.password !== data.contrasenhaConfirmada) {
      setError("La contraseñas no coinciden");
      setPestanha(1);
      return;
    }
    try {
      const persona = await completarUsuario(data);
      setIdPersona(persona);

      const tutor = await completarTutor(data, persona);
      setIdTutor(tutor);

      const personaInfante = await completarPersonaInfante(data);
      setIdPersonaInfante(personaInfante);

      const infante = await completarInfante(data, personaInfante);
      setIdInfante(infante);

      await crearInscripcion({
        id_tutor: tutor,
        id_infante: infante,
        observaciones: data.observaciones,
      });

      alert("Se ha enviado la solicitud de inscripción");
      navigate("/home");
    } catch (err) {
      console.error(err);
      setError(
        "Error al completar la inscripción. Por favor revisa los datos."
      );
      setPestanha(1);
      setFormulario({});
    }
  };

  const completarUsuario = async (data) => {
    const { contrasenhaConfirmada, ...datos } = data;
    const campos = {
      username: data.username,
      email: data.email,
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
    const res = await signUpApi(campos);
    if (res.status !== 201) throw new Error("Error al crear usuario");

    await loginUsuario({
      username: data.username,
      password: data.password,
      setError: (msg) => {
        setError("Error al tratar de iniciar sesión de forma automática");
        throw new Error(msg);
      },
    });

    return res.data.user.persona.id;
  };

  const completarTutor = async (data, idPersona) => {
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
    if (![200, 201].includes(res.status))
      throw new Error("Error creando tutor");
    return res.data.id;
  };

  const completarPersonaInfante = async (data) => {
    const personaInfante = {
      nombre: data.infante_nombre,
      apellido: data.infante_apellido,
      segundo_apellido: data.infante_segundo_apellido,
      fecha_nacimiento: data.infante_fecha_nacimiento,
      sexo: data.infante_sexo,
      ci: data.infante_ci,
      domicilio: data.infante_domicilio,
    };
    const res = await crearPersona(personaInfante);
    if (res.status !== 201)
      throw new Error("Error creando persona del infante");
    return res.data.id;
  };

  const completarInfante = async (data, idPersonaInfante) => {
    const infanteData = {
      id_persona: idPersonaInfante,
      ind_alergia: data.ind_alergia,
      ind_intolerancia_lactosa: data.ind_intolerancia_lactosa,
      ind_celiaquismo: data.ind_celiaquismo,
      permiso_cambio_panhal: data.permiso_cambio_panhal,
      permiso_fotos: data.permiso_fotos,
    };
    const res = await crearInfante(infanteData);
    if (![200, 201].includes(res.status))
      throw new Error("Error creando infante");
    return res.data.id;
  };

  return (
    <form onSubmit={handleSubmit(guardarDatos)} className="formulario">
      <div className="formulario-dentro">
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
      </div>
    </form>
  );
}
