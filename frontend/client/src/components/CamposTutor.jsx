import { useFormContext } from "react-hook-form";
import CampoRequerido from "./CampoRequerido";

export default function CamposTutor() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <>
      <h2 className="formulario-titulo">Datos del Tutor</h2>
      <div className="flex flex-col md:flex-row gap-8 ">
        <div className="flex-1">
          <h1 className="formulario-elemento">Relación con la institución:</h1>
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
            {...register("telefono_particular", { required: true })}
          />

          {errors.telefono_particular && <CampoRequerido />}
        </div>
        <div className="flex-1">
          <h4 className="formulario-elemento">Teléfono Trabajo</h4>
          <input
            type="text"
            className="formulario-input"
            {...register("telefono_trabajo", { required: true })}
          />

          <h4 className="formulario-elemento">Nombre de la Empresa</h4>
          <input
            type="text"
            className="formulario-input"
            {...register("nombre_empresa_trabajo", { required: true })}
          />
          {errors.nombre_empresa_trabajo && <CampoRequerido />}
          <h4 className="formulario-elemento">Dirección del Trabajo</h4>
          <input
            type="text"
            className="formulario-input"
            {...register("direccion_trabajo", { required: true })}
          />
          {errors.direccion_trabajo && <CampoRequerido />}
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
