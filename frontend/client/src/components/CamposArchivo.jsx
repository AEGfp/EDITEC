import { Controller, useFormContext } from "react-hook-form";
import CampoRequerido from "./CampoRequerido";

export default function CamposArchivo({ nombreCampo, esRequerido = false }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={nombreCampo}
      control={control}
      rules={{ required: esRequerido }}
      render={({ field: { onChange }, fieldState: { error } }) => (
        <div>
          <label className="formulario-elemento">Seleccionar archivo</label>
          <input
            className="formulario-input bg-green-100"
            type="file"
            onChange={(e) => {
              const archivo = e.target.files?.[0] || null;
              onChange(archivo);
            }}
          />
          {error && <CampoRequerido />}
        </div>
      )}
    />
  );
}
