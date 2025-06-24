import { useFormContext } from "react-hook-form";
import CampoRequerido from "./CampoRequerido";
import MostrarError from "./MostrarError";


export default function CamposTutor() {
 const {
   register,
   formState: { errors },
 } = useFormContext();


 return (
   <>
     <h2 className="formulario-titulo">Datos del Tutor</h2>


     <div className="flex flex-col md:flex-row gap-8">
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
           {...register("telefono_casa", {
             required: "El teléfono de casa es obligatorio",
             pattern: {
               value: /^[\d\s]{6,20}$/,
               message:
                 "El teléfono debe tener entre 6 y 15 dígitos numéricos",
             },
           })}
         />
         {errors.telefono_casa && (
           <CampoRequerido mensaje={errors.telefono_casa.message} />
         )}


         <h4 className="formulario-elemento">Teléfono Particular</h4>
         <input
           type="text"
           className="formulario-input"
           {...register("telefono_particular", {
             required: "El teléfono particular es obligatorio",
             pattern: {
               value: /^[\d\s]{6,20}$/,
               message:
                 "El teléfono debe tener entre 6 y 15 dígitos numéricos",
             },
           })}
         />
         {errors.telefono_particular && (
           <CampoRequerido mensaje={errors.telefono_particular.message} />
         )}
       </div>


       <div className="flex-1">
         <h4 className="formulario-elemento">Teléfono Trabajo</h4>
         <input
           type="text"
           className="formulario-input"
           {...register("telefono_trabajo", {
             required: "El teléfono de trabajo es obligatorio",
             pattern: {
               value: /^[\d\s]{6,20}$/,
               message:
                 "El teléfono debe tener entre 6 y 15 dígitos numéricos",
             },
           })}
         />
         {errors.telefono_trabajo && (
           <CampoRequerido mensaje={errors.telefono_trabajo.message} />
         )}


         <h4 className="formulario-elemento">Nombre de la Empresa</h4>
         <input
           type="text"
           className="formulario-input"
           {...register("nombre_empresa_trabajo", {
             required: "El nombre de la empresa es obligatorio",
           })}
         />
         {errors.nombre_empresa_trabajo && (
           <CampoRequerido
             mensaje={errors.nombre_empresa_trabajo.message}
           />
         )}


         <h4 className="formulario-elemento">Dirección del Trabajo</h4>
         <input
           type="text"
           className="formulario-input"
           {...register("direccion_trabajo", {
             required: "La dirección del trabajo es obligatoria",
           })}
         />
         {errors.direccion_trabajo && (
           <CampoRequerido mensaje={errors.direccion_trabajo.message} />
         )}


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



