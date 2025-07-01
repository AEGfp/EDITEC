import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";
import ValidarNumero from "../components/ValidarNumero";
import { obtenerInfantes } from "../api/infantes.api";
import {
  obtenerCajaCobro,
  crearCajaCobro,
  eliminarCajaCobro,
} from "../api/cobrocuotas.api";

export function CobroCuotasFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
    trigger,
  } = useForm({
    defaultValues: {
      fecha_cobro: new Date().toISOString().slice(0, 10),
      monto_cobrado: 0,
      metodo_pago: "EFECTIVO",
      observacion: "",
      infante_id: "",
      cuota_id: "",
      infante_nombre: "", // Para mostrar en modo visualización
      cuota_detalle: "", // Para mostrar en modo visualización
    },
  });

  const [infantes, setInfantes] = useState([]);
  const [cuotas, setCuotas] = useState([]);
  const [montoTotal, setMontoTotal] = useState(0);
  const [idCuota, setIdCuota] = useState(null);
  const [editable, setEditable] = useState(true);

  const navigate = useNavigate();
  const { id } = useParams();
  const pagina = "/cobros-cuotas";

  const infanteIdValue = watch("infante_id") || "";
  const cuotaIdValue = watch("cuota_id") || "";

  // Cargar lista de infantes para el modo de inserción
  useEffect(() => {
    async function cargarInfantes() {
      try {
        const res = await obtenerInfantes();
        setInfantes(res.data);
      } catch (error) {
        console.error("Error al cargar infantes:", error);
      }
    }
    cargarInfantes();
  }, []);

  // Cargar cuotas cuando se selecciona un infante en modo de inserción
  useEffect(() => {
    if (infanteIdValue && editable) {
      fetch(`http://localhost:8000/api/cuotas/infante/${infanteIdValue}/`)
        .then((res) => res.json())
        .then((data) => {
          setCuotas(data);
          setValue("cuota_id", "");
          setMontoTotal(0);
          setIdCuota(null);
        })
        .catch((e) => console.error("Error al cargar cuotas:", e));
    } else if (editable) {
      setCuotas([]);
      setValue("cuota_id", "");
      setMontoTotal(0);
      setIdCuota(null);
    }
  }, [infanteIdValue, setValue, editable]);

  // Cargar datos de un cobro existente o reiniciar para nuevo cobro
  useEffect(() => {
    async function cargarCobro() {
      if (id) {
        try {
          const { data } = await obtenerCajaCobro(id);
          setValue("fecha_cobro", data.fecha_cobro);
          setValue("monto_cobrado", parseFloat(data.monto_cobrado));
          setValue("metodo_pago", data.metodo_pago);
          setValue("observacion", data.observacion || "");

          // Mostrar infante_nombre y cuota_detalle en modo visualización
          setValue("infante_nombre", data.cuota.infante_nombre || "Sin nombre");
          const cuotaDetalle = `Cuota ${data.cuota.nro_cuota} – Gs${(data.cuota.monto_cuota + (data.cuota.monto_mora || 0))} (${data.cuota.estado})`;
          setValue("cuota_detalle", cuotaDetalle);

          // Establecer monto total
          const monto = parseFloat(data.cuota.monto_cuota || 0) + parseFloat(data.cuota.monto_mora || 0);
          setMontoTotal(monto);

          setEditable(false); // Modo solo lectura para cobros existentes
        } catch (error) {
          console.error("Error al cargar el cobro:", error);
        }
      } else {
        reset({
          fecha_cobro: new Date().toISOString().slice(0, 10),
          monto_cobrado: 0,
          metodo_pago: "EFECTIVO",
          observacion: "",
          infante_id: "",
          cuota_id: "",
          infante_nombre: "",
          cuota_detalle: "",
        });
        setEditable(true); // Modo edición para nuevos cobros
        setCuotas([]);
        setMontoTotal(0);
        setIdCuota(null);
      }
    }
    cargarCobro();
  }, [id, reset, setValue]);

  // Actualizar monto cuando se selecciona una cuota en modo de inserción
  const handleCuotaChange = (cuotaId) => {
    const cuota = cuotas.find((c) => c.id.toString() === cuotaId);
    if (cuota) {
      const mora = parseFloat(cuota.monto_mora || 0);
      const monto = parseFloat(cuota.monto_cuota || 0) + mora;
      setValue("monto_cobrado", monto, { shouldValidate: true });
      setMontoTotal(monto);
      setIdCuota(cuota.id);
    } else {
      setValue("monto_cobrado", 0);
      setMontoTotal(0);
      setIdCuota(null);
    }
    trigger("monto_cobrado");
  };

  // Enviar datos para guardar un nuevo cobro
  const onSubmit = handleSubmit(async (data) => {
    if (!idCuota) {
      alert("Debe seleccionar una cuota válida.");
      return;
    }

    const finalData = {
      cuota_id: parseInt(idCuota),
      monto_cobrado: parseFloat(data.monto_cobrado),
      metodo_pago: data.metodo_pago,
      observacion: data.observacion?.trim() || "",
    };

    try {
      await crearCajaCobro(finalData);
      navigate(pagina);
    } catch (error) {
      console.error("Error al guardar el cobro:", error.response?.data || error.message);
      alert("Error al guardar el cobro: " + (error.response?.data?.error || error.message));
    }
  });

  // Eliminar un cobro existente
  const descartarCobro = async () => {
    const confirmar = window.confirm("¿Deseas eliminar este cobro?");
    if (confirmar) {
      try {
        await eliminarCajaCobro(id);
        navigate(pagina);
      } catch (error) {
        console.error("Error al eliminar el cobro:", error);
        alert("Error al eliminar el cobro: " + (error.response?.data?.error || error.message));
      }
    }
  };

  const puedeEscribir = tienePermiso("cajasCobros", "escritura");

  return (
    <div className="min-h-screen bg-blue-50 flex justify-center items-center py-10">
      <div className="bg-white rounded-xl shadow-md w-full max-w-2xl p-6">
        <div className="bg-blue-100 rounded-md px-4 py-2 mb-6 text-center">
          <h2 className="text-lg font-bold text-blue-700 flex items-center justify-center gap-2">
            💰 {id ? "Detalle de Cobro" : "Nuevo Cobro de Cuota"}
          </h2>
        </div>

        <form onSubmit={onSubmit} id="cobro-cuota" className="space-y-4">
          <fieldset disabled={!editable} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Infante</label>
              {editable ? (
                <select
                  className="formulario-input w-full"
                  {...register("infante_id", { required: true })}
                >
                  <option value="">Seleccione un infante</option>
                  {infantes.map((infante) => (
                    <option key={infante.id} value={infante.id.toString()}>
                      {infante.id_persona
                        ? `${infante.id_persona.nombre} ${infante.id_persona.apellido}`
                        : "Sin nombre"}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="formulario-input w-full"
                  readOnly
                  {...register("infante_nombre")}
                />
              )}
              {errors.infante_id && editable && <CampoRequerido />}
              {errors.infante_nombre && !editable && <CampoRequerido />}
            </div>

            <div>
              <label className="block mb-1 font-medium">Cuota</label>
              {editable ? (
                <select
                  className="formulario-input w-full"
                  value={cuotaIdValue}
                  onChange={(e) => {
                    setValue("cuota_id", e.target.value);
                    handleCuotaChange(e.target.value);
                  }}
                >
                  <option value="">Seleccione una cuota</option>
                  {cuotas.map((cuota) => (
                    <option
                      key={cuota.id}
                      value={cuota.id}
                      style={{ color: cuota.estado === "PAGADA" ? "gray" : "black" }}
                    >
                      Cuota {cuota.nro_cuota} – Gs{cuota.monto_cuota + (cuota.monto_mora || 0)} ({cuota.estado})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="formulario-input w-full"
                  readOnly
                  {...register("cuota_detalle")}
                />
              )}
              {errors.cuota_id && editable && <CampoRequerido />}
              {errors.cuota_detalle && !editable && <CampoRequerido />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Monto a Cobrar</label>
                <input
                  type="number"
                  className="formulario-input w-full"
                  readOnly={!editable}
                  {...register("monto_cobrado", {
                    required: true,
                  })}
                />
                {errors.monto_cobrado?.type === "required" && <CampoRequerido />}
                <p className="text-sm text-gray-500 mt-1">Monto total: Gs{montoTotal.toLocaleString()}</p>
              </div>

              <div>
                <label className="block mb-1 font-medium">Método de Pago</label>
                {editable ? (
                  <select 
                    className="formulario-input w-full" 
                    {...register("metodo_pago", { required: true })}
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="TARJETA">Tarjeta</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    className="formulario-input w-full"
                    readOnly
                    {...register("metodo_pago")}
                  />
                )}
                {errors.metodo_pago && <CampoRequerido />}
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium">Observación</label>
              <textarea
                className="formulario-input w-full min-h-[100px]"
                readOnly={!editable}
                {...register("observacion", {
                  maxLength: 200,
                  onBlur: (e) => {
                    if (e.target.value === "") setValue("observacion", "");
                  },
                })}
              ></textarea>
            </div>
          </fieldset>

        <div className="botones-grupo">
          {!id && puedeEscribir && editable && (
            <button type="submit" form="cobro-cuota" className="boton-guardar">
              Guardar
            </button>
          )}
          {/*id && puedeEscribir && (
            <button onClick={descartarCobro} className="boton-eliminar">
              Eliminar
            </button>
          )*/}
        </div>
      </div>
    </div>
  );
}