import React, { useState } from "react";
import { crearArchivo } from "../api/archivos.api";
import { useForm } from "react-hook-form";
import CampoRequerido from "./CampoRequerido";

export default function SubirArchivos({
  idPersona,
  cambiarNombre,
  tamanho = "",
  nombre = "archivo",
}) {
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
    if (!idPersona) {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      idPersona = usuario?.persona?.id;
    }
    const formData = new FormData();
    const archivo = data.archivo[0];
    formData.append("archivo", archivo);
    formData.append("descripcion", data.descripcion);
    formData.append("persona", idPersona);
    console.log(formData);
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
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error(error);
      setMensaje("Ha ocurrido un error al subir el archivo.");
      setTimeout(() => setMensaje(""), 3000);
    } finally {
      setCargando(false);
      setTimeout(() => setProgreso(0), 1000);
    }
  };
  return (
    <div className={"formulario" + "-" + tamanho}>
      <div className={"formulario-dentro" + "-" + tamanho}>
        <form onSubmit={handleSubmit(guardarArchivo)}>
          <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
            <label htmlFor="archivo" className="boton-detalles ">
              Examinar...
            </label>
            <span className="formulario-input">{nombreArchivo}</span>
          </div>

          <input
            type="file"
            id={nombre}
            name={nombre}
            accept=".pdf,.jpg,.jpeg,.png"
            {...register("archivo", {
              required: "El archivo es obligatorio",
              validate: {
                tipoValido: (value) =>
                  ["application/pdf", "image/jpeg", "image/png"].includes(
                    value?.[0]?.type
                  ) || "Formato no permitido",
                tamanoValido: (value) =>
                  value?.[0]?.size < 5 * 1024 * 1024 ||
                  "El archivo debe ser menor a 5MB",
              },
              onChange: (e) => {
                const archivo = e.target.files[0];
                const nombre = archivo?.name || "Ningún archivo seleccionado";
                setNombreArchivo(nombre);
                if (!cambiarNombre) {
                  setValue("descripcion", nombre);
                }
              },
            })}
            className="hidden"
          />
          {errors.archivo && (
            <p className="mensaje-error">{errors.archivo.message}</p>
          )}

          {cambiarNombre && (
            <>
              <input
                type="text"
                placeholder="Nombre para guardar el archivo"
                className="formulario-input"
                {...register("descripcion", {
                  required: "Debe ingresar un nombre para el archivo",
                })}
              />
              {errors.descripcion && <CampoRequerido />}
            </>
          )}

          {cargando && (
            <div className="w-full bg-gray-200 rounded h-6 mt-4 overflow-hidden relative">
              <div
                className="bg-green-500 h-full transition-all duration-300 ease-in-out"
                style={{ width: `${progreso}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-black">
                {progreso}%
              </div>
            </div>
          )}

          {mensaje && (
            <div
              className={`mt-4 text-sm font-semibold text-center ${
                mensaje.includes("error") || mensaje.includes("Error")
                  ? "mensaje-error"
                  : "mensjae-error text-green-600"
              }`}
            >
              {mensaje}
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
