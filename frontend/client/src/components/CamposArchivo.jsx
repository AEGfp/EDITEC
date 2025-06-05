import { useEffect } from "react";

export default function CamposArchivo({
  register,
  nombreCampo,
  setValue,
  watch,
}) {
  const archivoSeleccionado = watch(nombreCampo);

  useEffect(() => {
    register(nombreCampo); 
  }, [register, nombreCampo]);

  const manejarCambioArchivo = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setValue(nombreCampo, archivo, { shouldValidate: true });
    }
  };

  return (
    <div>
      <label className="formulario-elemento">Seleccionar archivo</label>
      <input type="file" onChange={manejarCambioArchivo} />
      {archivoSeleccionado && <p>{archivoSeleccionado.name}</p>}
    </div>
  );
}
