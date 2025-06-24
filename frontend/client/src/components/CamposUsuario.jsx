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
            clearErrors(); // Limpiar errores si todo está correcto
          })
          .catch((err) => {
            const errorMessage = err.message;
            if (errorMessage.includes("usuario")) {
              setError("username", { type: "manual", message: "Este nombre de usuario ya está en uso" });
            }
            if (errorMessage.includes("correo")) {
              setError("email", { type: "manual", message: "Este correo electrónico ya está en uso" });
            }
            if (errorMessage.includes("CI")) {
              setError("ci", { type: "manual", message: "Este CI ya está registrado" });
            }
          });
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [username, email, ci, setError, clearErrors]);

  return (
    <>
      <h2 className="formulario-titulo">Datos del Tutor</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          {/* Nombre de Usuario */}
          <div className="formulario-elemento">
            <h3>Nombre de Usuario:</h3>
          </div>
          <input
            type="text"
            placeholder="Nombre de usuario"
            className="formulario-input"
            {...register("username", { required: "Este campo es obligatorio" })}
          />
          {errors.username && (
            <p className="mensaje-error">{errors.username.message || "Este campo es obligatorio"}</p>
          )}

          {/* Contraseña */}
          <div className="formulario-elemento">
            <h3>Contraseña:</h3>
          </div>
          <input
            type="password"
            placeholder="Contraseña"
            className="formulario-input"
            {...register("password", { required: "Este campo es obligatorio" })}
          />
          {errors.password && <p className="mensaje-error">Este campo es obligatorio</p>}

          {/* Reescribir contraseña */}
          <div className="formulario-elemento">
            <h3>Reescriba la contraseña:</h3>
          </div>
          <input
            type="password"
            className="formulario-input"
            {...register("contrasenhaConfirmada", {
              required: "Por favor repita la contraseña",
              validate: (value) =>
                value === watch("password") || "Las contraseñas no coinciden",
            })}
          />
          {errors.contrasenhaConfirmada && (
            <p className="mensaje-error">{errors.contrasenhaConfirmada.message}</p>
          )}

          {/* Email */}
          <div className="formulario-elemento">
            <h3>Correo electrónico:</h3>
          </div>
          <input
            type="email"
            placeholder="Correo"
            className="formulario-input"
            {...register("email", {
              required: "Este campo es obligatorio",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Por favor ingresa un correo electrónico válido (ej: usuario@dominio.com)"
              },
            })}
          />
          {errors.email && <p className="mensaje-error">{errors.email.message || "Este campo es obligatorio"}</p>}
        </div>

        <div className="flex-1">
          {/* Nombre */}
          <div className="formulario-elemento">
            <h3>Nombre:</h3>
          </div>
          <input
            type="text"
            placeholder="Nombre"
            className="formulario-input"
            {...register("nombre", { required: "Este campo es obligatorio" })}
          />
          {errors.nombre && <p className="mensaje-error">Este campo es obligatorio</p>}

          {/* Apellido */}
          <div className="formulario-elemento">
            <h3>Apellido:</h3>
          </div>
          <input
            type="text"
            placeholder="Apellido"
            className="formulario-input"
            {...register("apellido", { required: "Este campo es obligatorio" })}
          />
          {errors.apellido && <p className="mensaje-error">Este campo es obligatorio</p>}

          {/* Segundo apellido */}
          <div className="formulario-elemento">
            <h3>Segundo apellido:</h3>
          </div>
          <input
            type="text"
            placeholder="Segundo apellido"
            className="formulario-input"
            {...register("segundo_apellido")}
          />

          {/* CI */}
          <div className="formulario-elemento">
            <h3>CI:</h3>
          </div>
          <input
            type="text"
            placeholder="CI"
            className="formulario-input"
            {...register("ci", {
              required: "Este campo es obligatorio",
              pattern: {
                value: /^\d{5,}[A-D]?$/,
                message: "Debe tener al menos 5 números y puede terminar con una letra A, B, C o D",
              },
            })}
          />
          {errors.ci && <p className="mensaje-error">{errors.ci.message}</p>}

          {/* Fecha de nacimiento */}
          <div className="formulario-elemento">
            <h3>Fecha de nacimiento:</h3>
          </div>
          <input
            type="date"
            className="formulario-input"
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
                  return fecha <= fechaMinima || "El tutor debe tener al menos 18 años";
                },
              },
            })}
          />
          {errors.fecha_nacimiento && (
            <p className="mensaje-error">{errors.fecha_nacimiento.message}</p>
          )}

          {/* Sexo */}
          <div className="formulario-elemento">
            <fieldset>
              <legend>
                <h3>Sexo:</h3>
              </legend>
              <div>
                <input
                  type="radio"
                  id="masculino"
                  value="M"
                  {...register("sexo", { required: "Este campo es obligatorio" })}
                />
                <label htmlFor="masculino">Masculino</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="femenino"
                  value="F"
                  {...register("sexo", { required: "Este campo es obligatorio" })}
                />
                <label htmlFor="femenino">Femenino</label>
              </div>
            </fieldset>
          </div>
          {errors.sexo && <p className="mensaje-error">Este campo es obligatorio</p>}

          {/* Domicilio */}
          <div className="formulario-elemento">
            <h3>Domicilio:</h3>
          </div>
          <input
            type="text"
            placeholder="Calle c/ calle, nro de calle, ciudad"
            className="formulario-input"
            {...register("domicilio")}
          />
        </div>
      </div>
    </>
  );
}
