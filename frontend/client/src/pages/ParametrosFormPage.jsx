import { useForm } from "react-hook-form";
import {
  crearParametro,
  eliminarParametro,
  actualizarParametro,
  obtenerParametro,
} from "../api/parametros.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";

export function ParametrosFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm();

  const [editable, setEditable] = useState(false);
  const navigate = useNavigate();
  const pagina = "/parametros";
  const params = useParams();

  const meses = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ];

  useEffect(() => {
    async function cargarParametro() {
      if (params.id) {
        const { data } = await obtenerParametro(params.id);
        setValue("anho", data.anho);
        setValue("mes_inicio", data.mes_inicio);
        setValue("mes_fin", data.mes_fin);
        setValue("dia_limite_pago", data.dia_limite_pago);
        setValue("dias_gracia", data.dias_gracia);
        setValue("monto_cuota", data.monto_cuota);
        setValue("mora_por_dia", data.mora_por_dia);
        setValue("estado", data.estado);
      } else {
        reset();
        setEditable(true);
      }
    }
    cargarParametro();
  }, [params.id, setValue, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (params.id) {
        await actualizarParametro(params.id, data);
      } else {
        await crearParametro(data);
      }
      navigate(pagina);
    } catch (error) {
      const backendErrors = error.response?.data;
      if (backendErrors?.non_field_errors?.length > 0) {
        alert("Error: " + backendErrors.non_field_errors[0]);
      } else {
        alert("Error al guardar: " + JSON.stringify(backendErrors));
      }
      console.error("Detalles del error:", backendErrors);
    }
  });

  const habilitarEdicion = async () => setEditable(true);

  const descartarParametro = async () => {
    const aceptar = window.confirm("¿Estás seguro que quieres eliminar el parámetro?");
    if (aceptar) {
      await eliminarParametro(params.id);
      navigate(pagina);
    }
  };

  const puedeEscribir = tienePermiso("parametros", "escritura");

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
        <div className="bg-blue-100 p-2 rounded flex items-center justify-center mb-4">
          <h1 className="text-lg font-semibold text-blue-800">📊 Nuevo Parámetro</h1>
        </div>

        <form onSubmit={onSubmit} id="editar-parametro">
          <fieldset disabled={!editable} className="space-y-4">
            <div>
              <label className="formulario-elemento">Mes de inicio</label>
              <select
                className="formulario-input"
                id="mes_inicio"
                {...register("mes_inicio", {
                  valueAsNumber: true,
                  validate: (value) =>
                    value <= watch("mes_fin") || "El mes de inicio debe ser menor o igual al mes de fin",
                })}
              >
                <option value="">Seleccione un mes</option>
                {meses.map((mes) => (
                  <option key={mes.value} value={mes.value}>
                    {mes.label}
                  </option>
                ))}
              </select>
              {errors.mes_inicio && <CampoRequerido />}
            </div>

            <div>
              <label className="formulario-elemento">Mes final</label>
              <select
                className="formulario-input"
                id="mes_fin"
                {...register("mes_fin", { valueAsNumber: true })}
              >
                <option value="">Seleccione un mes</option>
                {meses.map((mes) => (
                  <option key={mes.value} value={mes.value}>
                    {mes.label}
                  </option>
                ))}
              </select>
              {errors.mes_fin && <CampoRequerido />}
            </div>

            <div>
              <label className="formulario-elemento">Día de Vencimiento</label>
              <input
                type="number"
                placeholder="Ingrese el día de vencimiento"
                className="formulario-input"
                {...register("dia_limite_pago", {
                  required: "Este campo es obligatorio",
                  valueAsNumber: true,
                  min: { value: 1, message: "El día debe ser mayor o igual a 1" },
                  max: { value: 31, message: "El día debe ser menor o igual a 31" },
                })}
              />
              {errors.dia_limite_pago && (
                <span className="error-mensaje">{errors.dia_limite_pago.message || <CampoRequerido />}</span>
              )}
            </div>

            <div>
              <label className="formulario-elemento">Días de Gracia</label>
              <input
                type="number"
                placeholder="Ingrese días de gracia por retraso"
                className="formulario-input"
                {...register("dias_gracia", {
                  required: "Este campo es obligatorio",
                  valueAsNumber: true,
                  min: { value: 1, message: "El valor debe ser mayor o igual a 1" },
                })}
              />
              {errors.dias_gracia && (
                <span className="error-mensaje">{errors.dias_gracia.message || <CampoRequerido />}</span>
              )}
            </div>

            <div>
              <label className="formulario-elemento">Monto de Cuota</label>
              <input
                type="number"
                placeholder="Ingrese el monto de la cuota"
                className="formulario-input"
                {...register("monto_cuota", {
                  required: "Este campo es obligatorio",
                  valueAsNumber: true,
                  min: { value: 1, message: "El valor debe ser mayor o igual a 1" },
                })}
              />
              {errors.monto_cuota && (
                <span className="error-mensaje">{errors.monto_cuota.message || <CampoRequerido />}</span>
              )}
            </div>

            <div>
              <label className="formulario-elemento">Monto de Mora</label>
              <input
                type="number"
                placeholder="Ingrese el monto de la mora por día"
                className="formulario-input"
                {...register("mora_por_dia", {
                  required: "Este campo es obligatorio",
                  valueAsNumber: true,
                  min: { value: 1, message: "El valor debe ser mayor o igual a 1" },
                })}
              />
              {errors.mora_por_dia && (
                <span className="error-mensaje">{errors.mora_por_dia.message || <CampoRequerido />}</span>
              )}
            </div>

            <div className="flex items-center">
              <label className="formulario-elemento mb-0 mr-2">Activo:</label>
              <input type="checkbox" {...register("estado", { required: false })} />
            </div>
          </fieldset>

          <div className="flex justify-center mt-6 gap-3">
            {puedeEscribir && !editable && (
              <button type="button" onClick={habilitarEdicion} className="boton-editar">
                ✏️ Editar
              </button>
            )}
            {puedeEscribir && editable && (
              <>
                <button type="submit" className="boton-guardar">
                  💾 Guardar
                </button>
                {params.id && (
                  <button type="button" onClick={descartarParametro} className="boton-eliminar">
                    🗑️ Eliminar
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
