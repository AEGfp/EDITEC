import React, { useState } from "react";
import { crearArchivo } from "../api/archivos.api";
import { useForm } from "react-hook-form";
import CampoRequerido from "./CampoRequerido";

// TODO: limitar cantidad de archivos y formatos
export default function SubirArchivos() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  const [mensaje, setMensaje] = useState("");

  const guardarArchivo = async (data) => {
    const formData = new FormData();
    const archivo = data.archivo[0];
    formData.append("archivo", archivo);
    formData.append("descripcion", archivo.name);

    try {
      await crearArchivo(formData);
      setMensaje("Archivo subido correctamente.");
      reset();
    } catch (error) {
      console.error(error);
      setMensaje("Ha ocurrido un error al subir el archivo.");
    }
  };

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        <form onSubmit={handleSubmit(guardarArchivo)}>
          <label htmlFor="archivo" className="formulario-elemento">
            Elige el/los archivo:
          </label>
          <input
            className="formulario-input"
            type="file"
            id="archivo"
            {...register("archivo", {
              required: "El archivo es obligatorio",
            })}
          />
          {errors.archivo && <CampoRequerido />}
          <div className="botones-grupo">
            <button type="submit" className="boton-guardar mt-4">
              Subir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
