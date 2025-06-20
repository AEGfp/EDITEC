import { useEffect } from "react";
import CampoRequerido from "./CampoRequerido";
import CamposArchivo from "./CamposArchivo";
import { useFormContext } from "react-hook-form";

export default function CamposInfante() {
  const {
    register,
    setValue,
    formState: { errors },
    watch,
  } = useFormContext();
  const permisoFotos = watch("permiso_fotos");
  const permisoPanhal = watch("permiso_cambio_panhal");

  useEffect(() => {
    if (permisoPanhal !== "S") {
      setValue("archivo_permiso_panhal", null);
    }
  }, [permisoPanhal, setValue]);

  useEffect(() => {
    if (permisoFotos !== "S") {
      setValue("archivo_permiso_fotos", null);
    }
  }, [permisoFotos, setValue]);

  return (
    <>
      <h2 className="formulario-titulo">Datos del Infante</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <h4 className="formulario-elemento">Nombre</h4>
          <input
            className="formulario-input"
            {...register("infante_nombre", { required: true })}
          />
          {errors.infante_nombre && <CampoRequerido />}

          <h4 className="formulario-elemento">Apellido</h4>
          <input
            className="formulario-input"
            {...register("infante_apellido", { required: true })}
          />
          {errors.infante_apellido && <CampoRequerido />}

          <h4 className="formulario-elemento">Segundo Apellido</h4>
          <input
            className="formulario-input"
            {...register("infante_segundo_apellido")}
          />

          <h4 className="formulario-elemento">CI</h4>
          <input
            className="formulario-input"
            {...register("infante_ci", { required: true })}
          />
          {errors.infante_ci && <CampoRequerido />}

          <h4 className="formulario-elemento">Fecha de Nacimiento</h4>
  <input
  type="date"
  className="formulario-input"
  {...register("infante_fecha_nacimiento", {
    required: "Campo requerido",
    validate: {
      noHoyNiFuturo: (value) => {
        if (!value) return true;
        const fecha = new Date(value);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // limpiar hora
        return fecha < hoy || "La fecha no puede ser futura";
      }
    }
  })}
/>
{errors.infante_fecha_nacimiento && (
  <p className="text-red-500 text-sm mt-1">
    {errors.infante_fecha_nacimiento.message}
  </p>
)}

          <h4 className="formulario-elemento">Sexo</h4>
          <select
            className="formulario-input"
            {...register("infante_sexo", { required: true })}
          >
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
          {errors.infante_sexo && <CampoRequerido />}

          <h4 className="formulario-elemento">Domicilio</h4>
          <input
            className="formulario-input"
            {...register("infante_domicilio")}
          />
        </div>
        <div className="flex-1">
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
          <select className="formulario-input" {...register("ind_celiaquismo")}>
            <option value="N">No</option>
            <option value="S">Sí</option>
          </select>

          <h4 className="formulario-elemento">¿Permiso para cambiar pañal?</h4>
          <select
            className="formulario-input"
            {...register("permiso_cambio_panhal")}
          >
            <option value="N">No</option>
            <option value="S">Sí</option>
          </select>

          {permisoPanhal === "S" && (
            <CamposArchivo
              register={register}
              setValue={setValue}
              watch={watch}
              nombreCampo="archivo_permiso_panhal"
              esRequerido={true}
            />
          )}
          <h4 className="formulario-elemento">¿Permiso para fotos?</h4>
          <select className="formulario-input" {...register("permiso_fotos")}>
            <option value="N">No</option>
            <option value="S">Sí</option>
          </select>

          {permisoFotos === "S" && (
            <CamposArchivo
              register={register}
              setValue={setValue}
              watch={watch}
              nombreCampo="archivo_permiso_fotos"
              esRequerido={true}
            />
          )}
        </div>
      </div>
    </>
  );
}
