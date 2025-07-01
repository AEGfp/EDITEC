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
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      {/* Título */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-700">DOCUMENTOS DEL INFANTE</h1>
        <div className="w-24 h-1 mx-auto bg-blue-400 rounded-full mt-2" />
      </div>

      {/* Formulario */}
      <div className="space-y-6">
        {/* Fotocopia de cédula del tutor */}
        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-medium mb-2">Fotocopia de cédula del tutor:</h4>
          <CamposArchivo
            register={register}
            setValue={setValue}
            watch={watch}
            nombreCampo="archivo_cedula_tutor"
            esRequerido={true}
          />
        </div>

        {/* Fotocopia de cédula del infante */}
        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-medium mb-2">Fotocopia de cédula del infante:</h4>
          <CamposArchivo
            register={register}
            setValue={setValue}
            watch={watch}
            nombreCampo="archivo_cedula_infante"
            esRequerido={true}
          />
        </div>

        {/* Documento de relación con la UNA */}
        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-medium mb-2">Documento de relación del tutor con la UNA:</h4>
          <CamposArchivo
            register={register}
            setValue={setValue}
            watch={watch}
            nombreCampo="archivo_relacion_UNA"
            esRequerido={true}
          />
        </div>

        {/* Libreta de vacunación */}
        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-medium mb-2">Libreta de vacunación del infante:</h4>
          <CamposArchivo
            register={register}
            setValue={setValue}
            watch={watch}
            nombreCampo="archivo_libreta_vacunacion"
            esRequerido={true}
          />
        </div>

        {/* Certificados de discapacidad */}
        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-medium mb-2">Certificados de discapacidad (si aplica):</h4>
          {archivosDiscapacidad.map((i, index) => (
            <div key={index} className="mb-4">
              <div className="flex items-center gap-4">
                <CamposArchivo
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  nombreCampo={`archivo_discapacidad_${index}`}
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                  onClick={() => eliminarArchivoDiscapacidad(index)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors font-medium"
            onClick={agregarArchivoDiscapacidad}
          >
            + Agregar otro certificado
          </button>
        </div>
      </div>
    </div>
  );
}