import CampoRequerido from "./CampoRequerido";
import { useFormContext } from "react-hook-form";

export default function CamposUsuario() {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  return (
    <>
      <h2 className="formulario-titulo">Datos del Tutor</h2>
      <div className="flex flex-col md:flex-row gap-8 ">
        <div className="flex-1">
          <div className="formulario-elemento">
            <h3>Nombre de Usuario:</h3>
          </div>
          <input
            type="text"
            placeholder="Nombre de usuario"
            className="formulario-input"
            {...register("username", { required: true })}
          />
          {errors.username && <CampoRequerido />}

          <div className="formulario-elemento">
            <h3>Contraseña:</h3>
          </div>
          <input
            type="password"
            placeholder="Contraseña"
            className="formulario-input"
            {...register("password", { required: true })}
          />
          {errors.password && <CampoRequerido />}

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
            <p className="mensaje-error">
              {errors.contrasenhaConfirmada.message}
            </p>
          )}

          <div className="formulario-elemento">
            <h3>Correo electrónico:</h3>
          </div>
          <input
            type="email"
            placeholder="Correo"
            className="formulario-input"
            {...register("email", { required: true })}
          />
          {errors.email && <CampoRequerido />}
        </div>

        <div className="flex-1">
          <div className="formulario-elemento">
            <h3>Nombre:</h3>
          </div>
          <input
            type="text"
            placeholder="Nombre"
            className="formulario-input"
            {...register("nombre", { required: true })}
          />
          {errors.nombre && <CampoRequerido />}

          <div className="formulario-elemento">
            <h3>Apellido:</h3>
          </div>
          <input
            type="text"
            placeholder="Apellido"
            className="formulario-input"
            {...register("apellido", { required: true })}
          />
          {errors.apellido && <CampoRequerido />}

          <div className="formulario-elemento">
            <h3>Segundo apellido:</h3>
          </div>
          <input
            type="text"
            placeholder="Segundo apellido"
            className="formulario-input"
            {...register("segundo_apellido")}
          />

          <div className="formulario-elemento">
            <h3>CI:</h3>
          </div>
          <input
            type="number"
            placeholder="CI"
            className="formulario-input"
            {...register("ci", { required: true })}
          />
          {errors.ci && <CampoRequerido />}

          <div className="formulario-elemento">
            <h3>Fecha de nacimiento:</h3>
          </div>
          <input
            type="date"
            placeholder="01/01/1960"
            className="formulario-input"
            {...register("fecha_nacimiento", {
              required: "Campo requerido",
              validate: {
                noFutura: (value) => {
                  if (!value) return true;
                  const fecha = new Date(value);
                  const hoy = new Date();
                  hoy.setHours(0, 0, 0, 0);
                  return fecha <= hoy || "La fecha no puede ser futura";
                },
                mayorDeEdad: (value) => {
                  if (!value) return true;
                  const fecha = new Date(value);
                  const hoy = new Date();
                  const fechaMinima = new Date(
                    hoy.getFullYear() - 18,
                    hoy.getMonth(),
                    hoy.getDate()
                  );
                  return fecha <= fechaMinima || "El tutor debe tener al menos 18 años";
                },
              },
            })}
          />
          {errors.fecha_nacimiento && (
            <p className="text-red-500 text-sm mt-1">
              {errors.fecha_nacimiento.message}
            </p>
          )}

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
                  {...register("sexo", { required: true })}
                />
                <label htmlFor="masculino">Masculino</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="femenino"
                  value="F"
                  {...register("sexo", { required: true })}
                />
                <label htmlFor="femenino">Femenino</label>
              </div>
            </fieldset>
          </div>
          {errors.sexo && <CampoRequerido />}

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
