import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { verificarDisponibilidadUsuarioEmail } from "../api/inscripciones.api";

export default function CamposUsuario() {
  const {
    register,
    formState: { errors },
    watch,
    setError,
    clearErrors,
  } = useFormContext();

  const username = watch("username");
  const email = watch("email");
  const ci = watch("ci");

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (username || email || ci) {
        verificarDisponibilidadUsuarioEmail({ username, email, ci })
          .then(() => {
            clearErrors();
          })
          .catch((err) => {
            const errorMessage = err.message;
            if (errorMessage.includes("usuario")) {
              setError("username", {
                type: "manual",
                message: "Este nombre de usuario ya está en uso",
              });
            }
            if (errorMessage.includes("correo")) {
              setError("email", {
                type: "manual",
                message: "Este correo electrónico ya está en uso",
              });
            }
            if (errorMessage.includes("CI")) {
              setError("ci", {
                type: "manual",
                message: "Este CI ya está registrado",
              });
            }
          });
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [username, email, ci, setError, clearErrors]);

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
          {/* Nombre de Usuario */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Nombre de Usuario:</label>
            <input
              type="text"
              className={`w-full px-2 py-1 bg-transparent focus:outline-none ${errors.username ? "text-red-500" : ""}`}
              {...register("username", { required: "Este campo es obligatorio" })}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Contraseña */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Contraseña:</label>
            <input
              type="password"
              className={`w-full px-2 py-1 bg-transparent focus:outline-none ${errors.password ? "text-red-500" : ""}`}
              {...register("password", { required: "Este campo es obligatorio" })}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Reescriba la contraseña:</label>
            <input
              type="password"
              className={`w-full px-2 py-1 bg-transparent focus:outline-none ${errors.contrasenhaConfirmada ? "text-red-500" : ""}`}
              {...register("contrasenhaConfirmada", {
                required: "Este campo es obligatorio",
                validate: (value) =>
                  value === watch("password") || "Las contraseñas no coinciden",
              })}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
            {errors.contrasenhaConfirmada && (
              <p className="text-red-500 text-xs mt-1">{errors.contrasenhaConfirmada.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Correo electrónico:</label>
            <input
              type="email"
              className={`w-full px-2 py-1 bg-transparent focus:outline-none ${errors.email ? "text-red-500" : ""}`}
              {...register("email", {
                required: "Este campo es obligatorio",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Correo electrónico no válido",
                },
              })}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          {/* Nombre */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Nombre:</label>
            <input
              type="text"
              className={`w-full px-2 py-1 bg-transparent focus:outline-none ${errors.nombre ? "text-red-500" : ""}`}
              {...register("nombre", { required: "Este campo es obligatorio" })}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
            {errors.nombre && (
              <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>
            )}
          </div>

          {/* Apellido */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Apellido:</label>
            <input
              type="text"
              className={`w-full px-2 py-1 bg-transparent focus:outline-none ${errors.apellido ? "text-red-500" : ""}`}
              {...register("apellido", { required: "Este campo es obligatorio" })}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
            {errors.apellido && (
              <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>
            )}
          </div>

          {/* Segundo apellido */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Segundo apellido:</label>
            <input
              type="text"
              className="w-full px-2 py-1 bg-transparent focus:outline-none"
              {...register("segundo_apellido")}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
          </div>

          {/* CI */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">CI:</label>
            <input
              type="text"
              className={`w-full px-2 py-1 bg-transparent focus:outline-none ${errors.ci ? "text-red-500" : ""}`}
              {...register("ci", {
                required: "Este campo es obligatorio",
                pattern: {
                  value: /^\d{5,}[A-D]?$/,
                  message: "CI no válido",
                },
              })}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
            {errors.ci && (
              <p className="text-red-500 text-xs mt-1">{errors.ci.message}</p>
            )}
          </div>

          {/* Fecha de nacimiento */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Fecha de nacimiento:</label>
            <input
              type="date"
              className={`w-full px-2 py-1 bg-transparent focus:outline-none ${errors.fecha_nacimiento ? "text-red-500" : ""}`}
              {...register("fecha_nacimiento", {
                required: "Este campo es obligatorio",
                validate: {
                  noFutura: (value) => {
                    const fecha = new Date(value);
                    const hoy = new Date();
                    hoy.setHours(0, 0, 0, 0);
                    return fecha <= hoy || "La fecha no puede ser futura";
                  },
                  mayorDeEdad: (value) => {
                    const fecha = new Date(value);
                    const hoy = new Date();
                    const fechaMinima = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
                    return fecha <= fechaMinima || "Debe tener al menos 18 años";
                  },
                },
              })}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
            {errors.fecha_nacimiento && (
              <p className="text-red-500 text-xs mt-1">{errors.fecha_nacimiento.message}</p>
            )}
          </div>

          {/* Sexo */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-2">Sexo:</label>
            <div className="flex gap-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="M"
                  className="mr-2"
                  {...register("sexo", { required: "Este campo es obligatorio" })}
                />
                Masculino
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="F"
                  className="mr-2"
                  {...register("sexo", { required: "Este campo es obligatorio" })}
                />
                Femenino
              </label>
            </div>
            {errors.sexo && (
              <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>
            )}
          </div>

          {/* Domicilio */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block font-medium mb-1">Domicilio:</label>
            <input
              type="text"
              className="w-full px-2 py-1 bg-transparent focus:outline-none"
              {...register("domicilio")}
            />
            <div className="h-px bg-gray-300 mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
}