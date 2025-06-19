import { useForm } from "react-hook-form";
import {
  crearInfante,
  actualizarInfante,
  eliminarInfante,
  obtenerInfante,
  crearReporteInfante,
} from "../api/infantes.api";
import { crearPersona, actualizarPersona } from "../api/personas.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";
import MostrarError from "../components/MostrarError";

function InfantesFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    defaultValues: {
      es_propio: false,
    },
  });

  const [editable, setEditable] = useState(false);
  const [errorBackend, setErrorBackend] = useState(null);
  const navigate = useNavigate();
  const params = useParams();
  const pagina = "/infantes";
  const puedeEscribir = tienePermiso("infantes", "escritura");

  useEffect(() => {
    async function cargarInfante() {
      try {
        if (params.id) {
          const { data } = await obtenerInfante(params.id);
          const persona = data.id_persona || {};
          const personaId = typeof persona === "object" ? persona.id : persona;

          setValue("id_persona", personaId);
          setValue("nombre", persona.nombre || "");
          setValue("apellido", persona.apellido || "");
          setValue("ci", persona.ci || "");
          setValue("fecha_nacimiento", persona.fecha_nacimiento || "");
          setValue("sexo", persona.sexo || "");

          setValue("ind_alergia", data.ind_alergia);
          setValue("ind_intolerancia_lactosa", data.ind_intolerancia_lactosa);
          setValue("ind_celiaquismo", data.ind_celiaquismo);
          setValue("permiso_cambio_panhal", data.permiso_cambio_panhal);
          setValue("permiso_fotos", data.permiso_fotos);
          setValue("es_propio", data.es_propio);
          console.log(data);
          setEditable(false);
        } else {
          reset({
            ind_alergia: "N",
            ind_intolerancia_lactosa: "N",
            ind_celiaquismo: "N",
            permiso_cambio_panhal: "N",
            permiso_fotos: "N",
            sexo: "",
            fecha_nacimiento: "",
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
    setErrorBackend(null);
    try {
      const idPersona = data.id_persona || watch("id_persona");

      if (params.id) {
        await actualizarPersona(idPersona, {
          nombre: data.nombre,
          apellido: data.apellido,
          ci: data.ci,
          fecha_nacimiento: data.fecha_nacimiento,
          sexo: data.sexo,
        });

        await actualizarInfante(params.id, {
          id_persona: idPersona,
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
        fecha_nacimiento: data.fecha_nacimiento,
        sexo: data.sexo,
      });

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
      setErrorBackend(error.response?.data || "Error desconocido");
    }
  };

  const habilitarEdicion = () => setEditable(true);

  const descartarInfante = async () => {
    const confirmar = window.confirm(
      "¿Estás seguro que quieres eliminar este infante?"
    );
    if (confirmar) {
      await eliminarInfante(params.id);
      navigate(pagina);
    }
  };

  const generarReporteInfante = async () => {
    try {
      const res = await crearReporteInfante(params.id);
      const archivo = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(archivo);
      window.open(url);
    } catch (error) {
      console.error("Error al generar el PDF del infante:", error);
      alert("No se pudo generar el PDF.");
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
            <input
              className="formulario-input"
              {...register("nombre", {
                required: "El nombre es obligatorio",
                minLength: {
                  value: 2,
                  message: "El nombre debe tener al menos 2 letras",
                },
              })}
            />
            {errors.nombre && <MostrarError errores={errors.nombre.message} />}

            <h4 className="formulario-elemento">Apellido</h4>
            <input
              className="formulario-input"
              {...register("apellido", {
                required: "El apellido es obligatorio",
                minLength: {
                  value: 2,
                  message: "El apellido debe tener al menos 2 letras",
                },
              })}
            />
            {errors.apellido && (
              <MostrarError errores={errors.apellido.message} />
            )}

            <h4 className="formulario-elemento">CI</h4>
            <input
              className="formulario-input"
              {...register("ci", {
                required: "El CI es obligatorio",
                pattern: {
                  value: /^[0-9]+[A-D]?$/,
                  message:
                    "Debe contener solo números y opcionalmente una letra A-D al final",
                },
                minLength: {
                  value: 5,
                  message: "El CI debe tener al menos 5 caracteres",
                },
              })}
            />
            {errors.ci && <MostrarError errores={errors.ci.message} />}

            <h4 className="formulario-elemento">Fecha de Nacimiento</h4>
            <input
              className="formulario-input"
              type="date"
              {...register("fecha_nacimiento", {
                required: "La fecha de nacimiento es obligatoria",
                validate: (value) => {
                  if (!value) return "La fecha es obligatoria";

                  const hoy = new Date();
                  const fechaNacimiento = new Date(value);

                  const edadEnMeses =
                    (hoy.getFullYear() - fechaNacimiento.getFullYear()) * 12 +
                    (hoy.getMonth() - fechaNacimiento.getMonth());

                  return edadEnMeses >= 6 && edadEnMeses <= 48
                    ? true
                    : "El infante debe tener entre 6 meses y 4 años";
                },
              })}
            />
            {errors.fecha_nacimiento && (
              <MostrarError errores={errors.fecha_nacimiento.message} />
            )}

            <h4 className="formulario-elemento">Sexo</h4>
            <select
              className="formulario-input"
              {...register("sexo", { required: "Debe seleccionar un sexo" })}
            >
              <option value="">Seleccione</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
            {errors.sexo && <MostrarError errores={errors.sexo.message} />}

            <h4 className="formulario-elemento">¿Alergia?</h4>
            <select className="formulario-input" {...register("ind_alergia")}>
              <option value="N">No</option>
              <option value="S">Sí</option>
            </select>

            <h4 className="formulario-elemento">¿Intolerancia a la lactosa?</h4>
            <select
              className="formulario-input"
              {...register("ind_intolerancia_lactosa")}
            >
              <option value="N">No</option>
              <option value="S">Sí</option>
            </select>

            <h4 className="formulario-elemento">¿Celiaquismo?</h4>
            <select
              className="formulario-input"
              {...register("ind_celiaquismo")}
            >
              <option value="N">No</option>
              <option value="S">Sí</option>
            </select>

            <h4 className="formulario-elemento">
              ¿Permiso para cambiar pañal?
            </h4>
            <select
              className="formulario-input"
              {...register("permiso_cambio_panhal")}
            >
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

        <div className="botones-grupo ">
          <button
            onClick={generarReporteInfante}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Generar Reporte
          </button>

          {!editable && watch("es_propio") && (
            <button onClick={habilitarEdicion} className="boton-editar">
              Editar
            </button>
          )}

          {editable && watch("es_propio") && (
            <button
              type="submit"
              form="editar-infante"
              className="boton-guardar"
            >
              Guardar
            </button>
          )}

          {params.id && watch("es_propio") && editable && (
            <button onClick={descartarInfante} className="boton-eliminar">
              Eliminar
            </button>
          )}
        </div>
        {errorBackend && <MostrarError errores={errorBackend} />}
      </div>
    </div>
  );
}

export default InfantesFormPage;
