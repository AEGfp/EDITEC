import { useFormContext } from "react-hook-form";
import CampoRequerido from "./CampoRequerido";

export default function CamposTutor() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      {/* Título */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-700">DATOS DEL TUTOR</h1>
        <div className="w-24 h-1 mx-auto bg-blue-400 rounded-full mt-2" />
      </div>

      {/* Formulario en dos columnas */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Columna izquierda */}
        <div className="space-y-6">
          {/* Relación con la institución */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="font-medium mb-3">Relación con la institución:</h2>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 text-blue-600 rounded"
                  {...register("es_docente")}
                />
                Es Docente
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 text-blue-600 rounded"
                  {...register("es_estudiante")}
                />
                Es Estudiante
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 text-blue-600 rounded"
                  {...register("es_funcionario")}
                />
                Es Funcionario
              </label>
            </div>
          </div>

          {/* Teléfono Casa */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Teléfono Casa:</label>
            <input
              type="text"
              className={`w-full px-2 py-1 bg-transparent focus:outline-none ${errors.telefono_casa ? "text-red-500" : ""}`}
              {...register("telefono_casa", {
                required: "El teléfono de casa es obligatorio",
                pattern: {
                  value: /^[\d\s]{6,20}$/,
                  message: "El teléfono debe tener entre 6 y 15 dígitos numéricos",
                },
              })}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
            {errors.telefono_casa && (
              <p className="text-red-500 text-xs mt-1">{errors.telefono_casa.message}</p>
            )}
          </div>

          {/* Teléfono Particular */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Teléfono Particular:</label>
            <input
              type="text"
              className={`w-full px-2 py-1 bg-transparent focus:outline-none ${errors.telefono_particular ? "text-red-500" : ""}`}
              {...register("telefono_particular", {
                required: "El teléfono particular es obligatorio",
                pattern: {
                  value: /^[\d\s]{6,20}$/,
                  message: "El teléfono debe tener entre 6 y 15 dígitos numéricos",
                },
              })}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
            {errors.telefono_particular && (
              <p className="text-red-500 text-xs mt-1">{errors.telefono_particular.message}</p>
            )}
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          {/* Teléfono Trabajo */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Teléfono Trabajo:</label>
            <input
              type="text"
              className={`w-full px-2 py-1 bg-transparent focus:outline-none ${errors.telefono_trabajo ? "text-red-500" : ""}`}
              {...register("telefono_trabajo", {
                required: "El teléfono de trabajo es obligatorio",
                pattern: {
                  value: /^[\d\s]{6,20}$/,
                  message: "El teléfono debe tener entre 6 y 15 dígitos numéricos",
                },
              })}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
            {errors.telefono_trabajo && (
              <p className="text-red-500 text-xs mt-1">{errors.telefono_trabajo.message}</p>
            )}
          </div>

          {/* Nombre de la Empresa */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Nombre de la Empresa:</label>
            <input
              type="text"
              className={`w-full px-2 py-1 bg-transparent focus:outline-none ${errors.nombre_empresa_trabajo ? "text-red-500" : ""}`}
              {...register("nombre_empresa_trabajo", {
                required: "El nombre de la empresa es obligatorio",
              })}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
            {errors.nombre_empresa_trabajo && (
              <p className="text-red-500 text-xs mt-1">{errors.nombre_empresa_trabajo.message}</p>
            )}
          </div>

          {/* Dirección del Trabajo */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Dirección del Trabajo:</label>
            <input
              type="text"
              className={`w-full px-2 py-1 bg-transparent focus:outline-none ${errors.direccion_trabajo ? "text-red-500" : ""}`}
              {...register("direccion_trabajo", {
                required: "La dirección del trabajo es obligatoria",
              })}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
            {errors.direccion_trabajo && (
              <p className="text-red-500 text-xs mt-1">{errors.direccion_trabajo.message}</p>
            )}
          </div>

          {/* Observaciones */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Observaciones:</label>
            <textarea
              className="w-full px-2 py-1 bg-transparent focus:outline-none min-h-[80px]"
              {...register("observaciones")}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
}