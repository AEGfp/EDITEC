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
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      {/* Título */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-700">DATOS DEL INFANTE</h1>
        <div className="w-24 h-1 mx-auto bg-blue-400 rounded-full mt-2" />
      </div>

      {/* Formulario en dos columnas */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Columna izquierda */}
        <div className="space-y-6">
          {/* Nombre */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Nombre:</label>
            <input
              className={`w-full px-2 py-1 bg-transparent focus:outline-none ${errors.infante_nombre ? "text-red-500" : ""}`}
              {...register("infante_nombre", { required: "El nombre es obligatorio" })}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
            {errors.infante_nombre && (
              <p className="text-red-500 text-xs mt-1">{errors.infante_nombre.message}</p>
            )}
          </div>

          {/* Apellido */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Apellido:</label>
            <input
              className={`w-full px-2 py-1 bg-transparent focus:outline-none ${errors.infante_apellido ? "text-red-500" : ""}`}
              {...register("infante_apellido", { required: "El apellido es obligatorio" })}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
            {errors.infante_apellido && (
              <p className="text-red-500 text-xs mt-1">{errors.infante_apellido.message}</p>
            )}
          </div>

          {/* Segundo Apellido */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Segundo Apellido:</label>
            <input
              className="w-full px-2 py-1 bg-transparent focus:outline-none"
              {...register("infante_segundo_apellido")}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
          </div>

          {/* CI */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">CI:</label>
            <input
              className={`w-full px-2 py-1 bg-transparent focus:outline-none ${errors.infante_ci ? "text-red-500" : ""}`}
              {...register("infante_ci", {
                required: "El CI es obligatorio",
                pattern: {
                  value: /^\d{5,}[A-D]?$/,
                  message: "Debe tener al menos 5 números y puede terminar con una letra A, B, C o D",
                },
              })}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
            {errors.infante_ci && (
              <p className="text-red-500 text-xs mt-1">{errors.infante_ci.message}</p>
            )}
          </div>

          {/* Fecha de Nacimiento */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Fecha de Nacimiento:</label>
            <input
              type="date"
              className={`w-full px-2 py-1 bg-transparent focus:outline-none ${errors.infante_fecha_nacimiento ? "text-red-500" : ""}`}
              {...register("infante_fecha_nacimiento", {
                required: "La fecha de nacimiento es obligatoria",
                validate: (value) => {
                  const fecha = new Date(value);
                  const hoy = new Date();
                  hoy.setHours(0, 0, 0, 0);
                  return fecha < hoy || "La fecha no puede ser futura";
                },
              })}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
            {errors.infante_fecha_nacimiento && (
              <p className="text-red-500 text-xs mt-1">{errors.infante_fecha_nacimiento.message}</p>
            )}
          </div>

          {/* Sexo */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Sexo:</label>
            <select
              className={`w-full px-2 py-1 bg-transparent focus:outline-none ${errors.infante_sexo ? "text-red-500" : ""}`}
              {...register("infante_sexo", { required: "El sexo es obligatorio" })}
            >
              <option value="">Seleccione</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
            <div className="h-px bg-gray-300 mt-1"></div>
            {errors.infante_sexo && (
              <p className="text-red-500 text-xs mt-1">{errors.infante_sexo.message}</p>
            )}
          </div>

          {/* Domicilio */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Domicilio:</label>
            <input
              className="w-full px-2 py-1 bg-transparent focus:outline-none"
              {...register("infante_domicilio")}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
          </div>

          {/* Hora de Entrada */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Hora de Entrada:</label>
            <input
              type="time"
              className={`w-full px-2 py-1 bg-transparent focus:outline-none ${errors.hora_entrada ? "text-red-500" : ""}`}
              {...register("hora_entrada", {
                required: "La hora de entrada es obligatoria",
                validate: (value) => {
                  const [h, m] = value.split(":").map(Number);
                  const total = h * 60 + m;
                  return total >= 420 && total <= 900
                    ? true
                    : "La hora debe ser entre 07:00 y 15:00";
                },
              })}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
            {errors.hora_entrada && (
              <p className="text-red-500 text-xs mt-1">{errors.hora_entrada.message}</p>
            )}
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          {/* Alergia */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">¿Alergia?</label>
            <select className="w-full px-2 py-1 bg-transparent focus:outline-none" {...register("ind_alergia")}>
              <option value="N">No</option>
              <option value="S">Sí</option>
            </select>
            <div className="h-px bg-gray-300 mt-1"></div>
          </div>

          {/* Intolerancia a la lactosa */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">¿Intolerancia a la lactosa?</label>
            <select className="w-full px-2 py-1 bg-transparent focus:outline-none" {...register("ind_intolerancia_lactosa")}>
              <option value="N">No</option>
              <option value="S">Sí</option>
            </select>
            <div className="h-px bg-gray-300 mt-1"></div>
          </div>

          {/* Celiaquismo */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">¿Celiaquismo?</label>
            <select className="w-full px-2 py-1 bg-transparent focus:outline-none" {...register("ind_celiaquismo")}>
              <option value="N">No</option>
              <option value="S">Sí</option>
            </select>
            <div className="h-px bg-gray-300 mt-1"></div>
          </div>

          {/* Permiso para cambiar pañal */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">¿Permiso para cambiar pañal?</label>
            <select className="w-full px-2 py-1 bg-transparent focus:outline-none" {...register("permiso_cambio_panhal")}>
              <option value="N">No</option>
              <option value="S">Sí</option>
            </select>
            <div className="h-px bg-gray-300 mt-1"></div>
          </div>

          {permisoPanhal === "S" && (
            <div className="border-b border-gray-200 pb-4">
              <CamposArchivo
                register={register}
                setValue={setValue}
                watch={watch}
                nombreCampo="archivo_permiso_panhal"
                esRequerido={true}
              />
            </div>
          )}

          {/* Permiso para fotos */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">¿Permiso para fotos?</label>
            <select className="w-full px-2 py-1 bg-transparent focus:outline-none" {...register("permiso_fotos")}>
              <option value="N">No</option>
              <option value="S">Sí</option>
            </select>
            <div className="h-px bg-gray-300 mt-1"></div>
          </div>

          {permisoFotos === "S" && (
            <div className="border-b border-gray-200 pb-4">
              <CamposArchivo
                register={register}
                setValue={setValue}
                watch={watch}
                nombreCampo="archivo_permiso_fotos"
                esRequerido={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}