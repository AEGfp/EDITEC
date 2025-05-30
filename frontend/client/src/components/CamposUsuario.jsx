import CampoRequerido from "./CampoRequerido";

export default function CamposUsuario({ register, errors, watch }) {
  return (
    <>
      <h2 className="formulario-titulo">Datos del Tutor</h2>
      <div className="flex flex-col md:flex-row gap-8 ">
        <div className="flex-1">
          <div className="formulario-elemento">
            <h3>Nombre de Usuario: </h3>
          </div>
          <input
            type="text"
            placeholder="Nombre de usuario"
            className="formulario-input"
            {...register("username", { required: true })}
          />
          {errors.username && <CampoRequerido />}
          <div className="formulario-elemento">
            <h3>Constraseña: </h3>
          </div>
          <input
            type="password"
            {...register("password", { required: true })}
            placeholder="Contraseña"
            className="formulario-input"
          />
          {errors.password && <CampoRequerido />}

          <div className="formulario-elemento">
            <h3>Reescriba la contraseña:</h3>
          </div>
          <input
            type="password"
            {...register("contrasenhaConfirmada", {
              required: "Por favor repita la contraseña",
              validate: (value) =>
                value === watch("password") || "Las contraseñas no coinciden",
            })}
            className="formulario-input"
          />
          {errors.contrasenhaConfirmada && (
            <p className="mensaje-error">
              {errors.contrasenhaConfirmada.message}
            </p>
          )}

          <div className="formulario-elemento">
            <h3>Correo electrónico: </h3>
          </div>
          <input
            type="email"
            {...register("email", { required: true })}
            placeholder="Correo"
            className="formulario-input"
          />
          {errors.email && <CampoRequerido />}
        </div>
        <div className="flex-1">
          <div className="formulario-elemento">
            <h3>Nombre: </h3>
          </div>
          <input
            type="text"
            name="nombre"
            {...register("nombre", { required: true })}
            placeholder="Nombre"
            className="formulario-input"
          />
          {errors.nombre && <CampoRequerido />}
          <div className="formulario-elemento">
            <h3>Apellido: </h3>
          </div>
          <input
            type="text"
            name="apellido"
            {...register("apellido", { required: true })}
            placeholder="Apellido"
            className="formulario-input"
          />
          {errors.apellido && <CampoRequerido />}
          <div className="formulario-elemento">
            <h3>Segundo apellido: </h3>
          </div>
          <input
            type="text"
            name="segundo_apellido"
            {...register("segundo_apellido")}
            placeholder="Segundo apellido"
            className="formulario-input"
          />

          <div className="formulario-elemento">
            <h3>CI: </h3>
          </div>
          <input
            type="number"
            name="ci"
            {...register("ci", { required: true })}
            placeholder="CI"
            className="formulario-input"
          />
          {errors.ci && <CampoRequerido />}
          <div className="formulario-elemento">
            <h3>Fecha de nacimiento: </h3>
          </div>
          <input
            type="date"
            name="fecha_nacimiento"
            {...register("fecha_nacimiento", { required: true })}
            placeholder="01/01/1960"
            className="formulario-input"
          />
          {errors.fecha_nacimiento && <CampoRequerido />}
          <div className="formulario-elemento">
            <fieldset className="formulario-lista">
              <legend>
                <h3>Sexo: </h3>
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
            <h3>Domicilio: </h3>
          </div>
          <input
            type="text"
            name="domicilio"
            {...register("domicilio")}
            placeholder="Calle c/ calle, nro de calle, ciudad"
            className="formulario-input"
          />
          {/*<button
        type="submit"
        className="mt-4 boton-guardar mx-auto block"
        disabled={loading}
      >
        {loading ? "Registrando..." : "Sign in"}
      </button>

      {errors && <p className="text-red-600 font-bold text-sm">{errors}</p>}*/}
        </div>
      </div>
    </>
  );
}
