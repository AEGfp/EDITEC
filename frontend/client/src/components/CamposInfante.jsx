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
           {...register("infante_nombre", { required: "El nombre es obligatorio" })}
         />
         {errors.infante_nombre && <CampoRequerido mensaje={errors.infante_nombre.message} />}


         <h4 className="formulario-elemento">Apellido</h4>
         <input
           className="formulario-input"
           {...register("infante_apellido", { required: "El apellido es obligatorio" })}
         />
         {errors.infante_apellido && <CampoRequerido mensaje={errors.infante_apellido.message} />}


         <h4 className="formulario-elemento">Segundo Apellido</h4>
         <input className="formulario-input" {...register("infante_segundo_apellido")} />


         <h4 className="formulario-elemento">CI</h4>
         <input
           className="formulario-input"
           {...register("infante_ci", {
             required: "El CI es obligatorio",
             pattern: {
               value: /^\d{5,}[A-D]?$/,
               message: "Debe tener al menos 5 números y puede terminar con una letra A, B, C o D",
             },
           })}
         />
         {errors.infante_ci && <CampoRequerido mensaje={errors.infante_ci.message} />}


         <h4 className="formulario-elemento">Fecha de Nacimiento</h4>
         <input
           type="date"
           className="formulario-input"
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
         {errors.infante_fecha_nacimiento && (
           <CampoRequerido mensaje={errors.infante_fecha_nacimiento.message} />
         )}


         <h4 className="formulario-elemento">Sexo</h4>
         <select
           className="formulario-input"
           {...register("infante_sexo", { required: "El sexo es obligatorio" })}
         >
           <option value="">Seleccione</option>
           <option value="M">Masculino</option>
           <option value="F">Femenino</option>
         </select>
         {errors.infante_sexo && <CampoRequerido mensaje={errors.infante_sexo.message} />}


         <h4 className="formulario-elemento">Domicilio</h4>
         <input className="formulario-input" {...register("infante_domicilio")} />


         <h4 className="formulario-elemento">Hora de Entrada</h4>
         <input
           type="time"
           className="formulario-input"
           {...register("hora_entrada", {
             required: "La hora de entrada es obligatoria",
             validate: (value) => {
               const [h, m] = value.split(":").map(Number); // ✅ Corrección aquí
               const total = h * 60 + m;
               return total >= 420 && total <= 900
                 ? true
                 : "La hora debe ser entre 07:00 y 15:00";
             },
           })}
         />
         {errors.hora_entrada && <CampoRequerido mensaje={errors.hora_entrada.message} />}
       </div>


       <div className="flex-1">
         <h4 className="formulario-elemento">¿Alergia?</h4>
         <select className="formulario-input" {...register("ind_alergia")}>
           <option value="N">No</option>
           <option value="S">Sí</option>
         </select>


         <h4 className="formulario-elemento">¿Intolerancia a la lactosa?</h4>
         <select className="formulario-input" {...register("ind_intolerancia_lactosa")}>
           <option value="N">No</option>
           <option value="S">Sí</option>
         </select>


         <h4 className="formulario-elemento">¿Celiaquismo?</h4>
         <select className="formulario-input" {...register("ind_celiaquismo")}>
           <option value="N">No</option>
           <option value="S">Sí</option>
         </select>


         <h4 className="formulario-elemento">¿Permiso para cambiar pañal?</h4>
         <select className="formulario-input" {...register("permiso_cambio_panhal")}>
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





