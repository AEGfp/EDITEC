import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import CamposUsuario from "../components/CamposUsuario";
import CamposTutor from "../components/CamposTutor";
import CamposInfante from "../components/CamposInfante";
import CamposDocumentos from "../components/CamposDocumentos";
import SeleccionSala from "../components/SeleccionSala";
import { useNavigate, useLocation } from "react-router-dom";
import {
  crearInscripcion,
  crearInscripcionExistente,
} from "../api/inscripciones.api";
import MostrarError from "../components/MostrarError";
import ReCAPTCHA from "react-google-recaptcha";
export default function RealizarInscripcionPage() {
  const methods = useForm({ shouldUnregister: false });
  const {
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = methods;

  const location = useLocation();
  const omitirUsuario = location.state?.omitirUsuario || false;
  const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
  const [captchaValido, setCaptchaValido] = useState(false);
  const [pestanha, setPestanha] = useState(0);
  const [formulario, setFormulario] = useState({});
  const [captchaToken, setCaptchaToken] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorBackend, setErrorBackend] = useState(null);
  const [captchaError, setCaptchaError] = useState(false);
  const navigate = useNavigate();

  const siguiente = () => setPestanha((prev) => prev + 1);
  const previo = () => setPestanha((prev) => prev - 1);

  const pasos = [];
  if (!omitirUsuario) {
    pasos.push(
      <div className="flex flex-col items-center">
        <p className="mb-2">Por favor, completá el reCAPTCHA para continuar.</p>
        <ReCAPTCHA
          sitekey="6LeGr2crAAAAAJh1vlGtQLOFpJCGSX2ufqqxf49q"
          onChange={(value) => {
            console.log("Captcha completado:", value);
            setCaptchaValido(true);
            setCaptchaToken(value);
          }}
          onExpired={() => {
            setCaptchaValido(false);
            setCaptchaToken(null);
          }}
        />
        {captchaError && (
          <p className="mensaje-error mt-2">
            Por favor, completá el reCAPTCHA para continuar.
          </p>
        )}
      </div>
    );
    pasos.push(<CamposUsuario />);
  }
  if (usuarioLocal && Array.isArray(usuarioLocal.groups)) {
    console.log("Grupos del usuario:", usuarioLocal.groups);
  }

  const esTutor = usuarioLocal?.groups?.includes("tutor");

  if (!esTutor) {
    pasos.push(<CamposTutor />);
  }

  pasos.push(<CamposInfante />);
  pasos.push(<CamposDocumentos />);
  //pasos.push(<SeleccionSala />);
  /*pasos.push(
    <VistaPreviaInscripcion datos={formData}></VistaPreviaInscripcion>
  );*/

  const guardarDatos = async (data) => {
    if (!omitirUsuario && pestanha === 0 && !captchaValido) {
      setCaptchaError(true);
      alert("Por favor, completá el reCAPTCHA para continuar.");
      return;
    } else {
      setCaptchaError(false);
    }
    if (!omitirUsuario && pestanha === 0) {
      siguiente();
      return;
    }
    const datosActualizados = { ...formulario, ...data };
    if (
      pestanha ===
      pasos.findIndex((Paso) => Paso.type?.name === "CamposDocumentos")
    ) {
      const errores = [];
      if (!datosActualizados.archivo_cedula_tutor)
        errores.push("Falta la fotocopia de cédula del tutor.");
      if (!datosActualizados.archivo_cedula_infante)
        errores.push("Falta la fotocopia de cédula del infante.");
      if (!datosActualizados.archivo_relacion_UNA)
        errores.push("Falta el documento de relación con la UNA.");
      if (!datosActualizados.archivo_libreta_vacunacion)
        errores.push("Falta la libreta de vacunación.");
      if (
        datosActualizados.permiso_fotos === "S" &&
        !datosActualizados.archivo_permiso_fotos
      )
        errores.push(
          "Seleccionaste que sí permitís fotos, pero no cargaste el archivo de permiso."
        );
      if (
        datosActualizados.permiso_cambio_panhal === "S" &&
        !datosActualizados.archivo_permiso_panhal
      )
        errores.push(
          "Seleccionaste que sí permitís cambio de pañal, pero no cargaste el archivo de permiso."
        );
      if (errores.length > 0) {
        alert("Corrige los siguientes errores:\n\n" + errores.join("\n"));
        return;
      }
    }

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
    try {
      const formData = new FormData();

      const agregarCamposFormulario = (objeto, prefix = "") => {
        Object.entries(objeto).forEach(([key, value]) => {
          if (
            value !== null &&
            typeof value === "object" &&
            !(value instanceof File)
          ) {
            agregarCamposFormulario(value, prefix + key + ".");
          } else if (value !== undefined && value !== null) {
            formData.append(prefix + key, value);
          }
        });
      };

      [
        "archivo_permiso_fotos",
        "archivo_permiso_panhal",
        "archivo_cedula_tutor",
        "archivo_cedula_infante",
        "archivo_relacion_UNA",
        "archivo_libreta_vacunacion",
      ].forEach((campo) => {
        if (datos[campo]) {
          formData.append(campo, datos[campo]);
        }
      });

      Object.keys(datos).forEach((key) => {
        if (key.startsWith("archivo_discapacidad_") && datos[key]) {
          formData.append(key, datos[key]);
        }
      });

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
        hora_entrada: datos.hora_entrada,
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
      } else {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        inscripcion.user_id = usuario?.id;
      }

      agregarCamposFormulario(inscripcion);
      if (!omitirUsuario && captchaToken) {
        formData.append("captcha_token", captchaToken);
      }
      console.log(formData);
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const res = omitirUsuario
        ? await crearInscripcionExistente(formData)
        : await crearInscripcion(formData);

      if (res.status == 201) {
        alert("¡Inscripción completada con éxito!");
        navigate("/home");
      } else {
        throw new Error("Error al crear la inscripción");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Ha ocurrido un error al completar la inscripción"
      );
      setErrorBackend(
        err.response?.data?.detail &&
          typeof err.response.data.detail === "string"
          ? err.response.data.detail
          : "Ha ocurrido un error inesperado. Intenta nuevamente o contactá soporte."
      );
      setPestanha(0);
      //setFormulario({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(guardarDatos)} className="formulario">
        <div className="formulario-dentro md:max-w-4xl">
          {pasos[pestanha]}

          {errorBackend && <MostrarError errores={errorBackend} />}
          <div className="botones-grupo mt-4">
            {pestanha > 0 && (
              <button type="button" onClick={previo} className="boton-editar">
                Volver
              </button>
            )}
            <button
              type="submit"
              className="boton-guardar"
              disabled={!omitirUsuario && pestanha === 0 && !captchaValido}
            >
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
    </FormProvider>
  );
}
