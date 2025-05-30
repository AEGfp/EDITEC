export default function CamposTutor({ register, errors }) {
  return (
    <>
      <h2 className="formulario-titulo">Datos del Tutor</h2>
      <div className="flex flex-col md:flex-row gap-8 ">
        <div className="flex-1">
          <div className="formulario-lista">
            <label className="formulario-elemento">
              <input type="checkbox" {...register("es_docente")} />
              Es Docente
            </label>

            <label className="formulario-elemento">
              <input type="checkbox" {...register("es_estudiante")} />
              Es Estudiante
            </label>

            <label className="formulario-elemento">
              <input type="checkbox" {...register("es_funcionario")} />
              Es Funcionario
            </label>
          </div>
          <h4 className="formulario-elemento">Teléfono Casa</h4>
          <input
            type="text"
            className="formulario-input"
            {...register("telefono_casa", { required: true })}
          />
          {errors.telefono_casa && <CampoRequerido />}

          <h4 className="formulario-elemento">Teléfono Particular</h4>
          <input
            type="text"
            className="formulario-input"
            {...register("telefono_particular")}
          />
        </div>
        <div className="flex-1">
          <h4 className="formulario-elemento">Teléfono Trabajo</h4>
          <input
            type="text"
            className="formulario-input"
            {...register("telefono_trabajo")}
          />

          <h4 className="formulario-elemento">Nombre de la Empresa</h4>
          <input
            type="text"
            className="formulario-input"
            {...register("nombre_empresa_trabajo")}
          />

          <h4 className="formulario-elemento">Dirección del Trabajo</h4>
          <input
            type="text"
            className="formulario-input"
            {...register("direccion_trabajo")}
          />
          <h4 className="formulario-elemento">Observaciones</h4>
          <textarea
            className="formulario-input"
            {...register("observaciones")}
          />
        </div>
      </div>
    </>
  );
}
