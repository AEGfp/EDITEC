import { useState, useEffect } from "react";
import CampoRequerido from "./CampoRequerido";
import CamposArchivo from "./CamposArchivo";
import { useFormContext } from "react-hook-form";

export default function CamposDocumentos() {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();
  const [archivosDiscapacidad, setArchivosDiscapacidad] = useState([0]);

  const agregarArchivoDiscapacidad = () => {
    setArchivosDiscapacidad((prev) => [...prev, prev.length]);
  };

  const eliminarArchivoDiscapacidad = (index) => {
    setArchivosDiscapacidad((prev) => prev.filter((_, i) => i !== index));
    setValue(`archivo_discapacidad_${index}`, null, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <>
      <h2 className="formulario-titulo">Documentos del Infante</h2>

      <div className="flex flex-col gap-6">
        <div>
          <h4 className="formulario-elemento">
            Fotocopia de cédula de el tutor
          </h4>
          <CamposArchivo
            register={register}
            setValue={setValue}
            watch={watch}
            nombreCampo="archivo_cedula_tutor"
            esRequerido={true}
          />
        </div>

        <div>
          <h4 className="formulario-elemento">
            Fotocopia de cédula del infante
          </h4>
          <CamposArchivo
            register={register}
            setValue={setValue}
            watch={watch}
            nombreCampo="archivo_cedula_infante"
            esRequerido={true}
          />
        </div>
        <div>
          <h4 className="formulario-elemento">
            Documento de relación del tutor con la UNA
          </h4>
          <CamposArchivo
            register={register}
            setValue={setValue}
            watch={watch}
            nombreCampo="archivo_relacion_UNA"
            esRequerido={true}
          />
        </div>
        <div>
          <h4 className="formulario-elemento">
            Libreta de vacunación del infante
          </h4>
          <CamposArchivo
            register={register}
            setValue={setValue}
            watch={watch}
            nombreCampo="archivo_libreta_vacunacion"
            esRequerido={true}
          />
        </div>

        <div>
          <h4 className="formulario-elemento">
            Certificados de discapacidad (si aplica)
          </h4>
          {archivosDiscapacidad.map((i, index) => (
            <div key={index} className="mb-2">
              <CamposArchivo
                register={register}
                setValue={setValue}
                watch={watch}
                nombreCampo={`archivo_discapacidad_${index}`}
              />
              <button
                type="button"
                className="boton-eliminar"
                onClick={() => eliminarArchivoDiscapacidad(index)}
              >
                Eliminar
              </button>
            </div>
          ))}
          <button
            type="button"
            className="boton-guardar"
            onClick={agregarArchivoDiscapacidad}
          >
            Agregar
          </button>
        </div>
      </div>
    </>
  );
}
