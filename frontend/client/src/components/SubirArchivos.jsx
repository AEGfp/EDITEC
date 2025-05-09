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
  const [progreso, setProgreso] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [nombreArchivo, setNombreArchivo] = useState(
    "No se ha seleccionado ningún archivo."
  );

  const guardarArchivo = async (data) => {
    const formData = new FormData();
    const archivo = data.archivo[0];
    formData.append("archivo", archivo);
    formData.append("descripcion", archivo.name);

    try {
      setCargando(true);
      setProgreso(0);
      await crearArchivo(formData, {
        onUploadProgress: (e) => {
          const porcentaje = Math.round((e.loaded * 100) / e.total);
          setProgreso(porcentaje);
        },
      });

      setMensaje("Archivo subido correctamente.");
      reset();
      setNombreArchivo("No se ha seleccionado ningún archivo.");
    } catch (error) {
      console.error(error);
      setMensaje("Ha ocurrido un error al subir el archivo.");
    } finally {
      setCargando(false);
      setTimeout(() => setProgreso(0), 1000);
    }
  };

  return (
    <div className="">
      <div className="formulario-dentro">
        <form onSubmit={handleSubmit(guardarArchivo)}>
          <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
            <label htmlFor="archivo" className="boton-detalles ">
              Examinar...
            </label>
            <span className="formulario-input">{nombreArchivo}</span>
          </div>

          <input
            id="archivo"
            type="file"
            {...register("archivo", {
              required: "El archivo es obligatorio",
              onChange: (e) => {
                setNombreArchivo(
                  e.target.files[0]?.name || "Ningún archivo seleccionado"
                );
              },
            })}
            className="hidden"
          />
          {errors.archivo && <CampoRequerido />}

          {cargando && (
            <div className="w-full bg-gray-200 rounded h-6 mt-4 overflow-hidden relative">
              {/* Barra de progreso */}
              <div
                className="bg-green-500 h-full transition-all duration-300 ease-in-out"
                style={{ width: `${progreso}%` }}
              />
              {/* Porcentaje centrado */}
              <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-black">
                {progreso}%
              </div>
            </div>
          )}

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
