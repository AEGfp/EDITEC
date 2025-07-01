import { useForm } from "react-hook-form";
import {
  crearCajaPago,
  actualizarCajaPago,
  eliminarCajaPago,
  obtenerCajaPago,
} from "../api/cajaspagos.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";
import ValidarNumero from "../components/ValidarNumero";

export function CajasPagosFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    getValues,
    watch,
    trigger,
  } = useForm({
    defaultValues: {
      fecha_pago: new Date().toISOString().slice(0, 10),
      observaciones: 'Pago a proveedor',
      id_comprobante: '',
      nro_cuota: '',
    },
  });

  const [editable, setEditable] = useState(false);
  const [saldoDisponible, setSaldoDisponible] = useState(0);
  const [idSaldo, setIdSaldo] = useState(null);
  const [comprobantes, setComprobantes] = useState([]);
  const [saldos, setSaldos] = useState([]);

  const navigate = useNavigate();
  const pagina = "/caja-pagos";
  const params = useParams();

  const nroCuotaValue = watch("nro_cuota") || "";
  const idComprobanteValue = watch("id_comprobante") || "";

  useEffect(() => {
    async function cargarCajaPago() {
      if (params.id) {
        const { data } = await obtenerCajaPago(params.id);
        console.log("Datos del pago cargado:", data);

        const resComprobantes = await fetch("http://localhost:8000/api/comprobantes-pendientes/");
        const dataComprobantes = await resComprobantes.json();
        console.log("Comprobantes cargados:", dataComprobantes);
        setComprobantes(dataComprobantes);

        setValue("fecha_pago", data.fecha_pago);
        setValue("total_pago", data.total_pago);
        setValue("observaciones", data.observaciones || "Pago a proveedor");
        setValue("id_comprobante", data.id_comprobante.toString());

        const resCuotas = await fetch(`http://localhost:8000/api/cuotas-disponibles?id_comprobante=${data.id_comprobante}&mostrar_todas=true`);
        const dataCuotas = await resCuotas.json();
        console.log("Cuotas cargadas:", dataCuotas);
        setSaldos(dataCuotas);

        const cuota = dataCuotas.find(c => c.numero_cuota.toString() === data.nro_cuota.toString());
        if (cuota) {
          setValue("nro_cuota", cuota.numero_cuota.toString());
          setSaldoDisponible(cuota.saldo_cuota);
          setIdSaldo(cuota.id_saldo);
        }
        setEditable(false);
      } else {
        reset({
          fecha_pago: new Date().toISOString().slice(0, 10),
          observaciones: 'Pago a proveedor',
          id_comprobante: '',
          nro_cuota: '',
        });
        setEditable(true);

        const resComprobantes = await fetch("http://localhost:8000/api/comprobantes-pendientes/");
        const dataComprobantes = await resComprobantes.json();
        console.log("Comprobantes para nuevo:", dataComprobantes);
        setComprobantes(dataComprobantes);

        setSaldos([]);
        setSaldoDisponible(0);
        setIdSaldo(null);
      }
    }
    cargarCajaPago();
  }, [params.id, reset, setValue]);

  useEffect(() => {
    if (idComprobanteValue) {
      fetch(`http://localhost:8000/api/cuotas-disponibles?id_comprobante=${idComprobanteValue}`)
        .then((res) => res.json())
        .then((data) => {
          setSaldos(data);
          setValue("nro_cuota", "");
          setSaldoDisponible(0);
          setIdSaldo(null);
        })
        .catch((e) => console.error("Error al cargar cuotas:", e));
    } else {
      setSaldos([]);
      setValue("nro_cuota", "");
      setSaldoDisponible(0);
      setIdSaldo(null);
    }
  }, [idComprobanteValue, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    if (!idSaldo) {
      alert("Debe seleccionar una cuota válida.");
      return;
    }

    const finalData = {
      ...data,
      observaciones: data.observaciones?.trim() || "Pago a proveedor",
      id_saldo: idSaldo,
    };

    try {
      if (params.id) {
        await actualizarCajaPago(params.id, finalData);
      } else {
        await crearCajaPago(finalData);
      }

      navigate(pagina);
    } catch (error) {
      console.error("Detalles del error:", error.response?.data || error.message);
    }
  });

  const puedeEscribir = tienePermiso("cajasPagos", "escritura");

  const habilitarEdicion = () => setEditable(true);
  const descartarCajaPago = async () => {
    const confirmar = window.confirm("¿Deseas eliminar este pago?");
    if (confirmar) {
      await eliminarCajaPago(params.id);
      navigate(pagina);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex justify-center items-center py-10">
      <div className="bg-white rounded-xl shadow-md w-full max-w-2xl p-6">
        <div className="bg-blue-100 rounded-md px-4 py-2 mb-6 text-center">
          <h2 className="text-lg font-bold text-blue-700 flex items-center justify-center gap-2">
            💸 {params.id ? "Pago a Proveedor" : "Nuevo Pago a Proveedor"}
          </h2>
        </div>

        <form onSubmit={onSubmit} id="editar-caja-pago" className="space-y-4">
          <fieldset disabled={!editable} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Comprobante</label>
              <select
                className="formulario-input w-full"
                {...register("id_comprobante", { required: true })}
              >
                <option value="">Seleccione el comprobante</option>
                {comprobantes.map((comprobante) => (
                  <option key={comprobante.id} value={comprobante.id.toString()}>
                    {comprobante.descripcion}
                  </option>
                ))}
              </select>
              {errors.id_comprobante && <CampoRequerido />}
            </div>

            <div>
              <label className="block mb-1 font-medium">Cuota</label>
              <select
                className="formulario-input w-full"
                value={nroCuotaValue}
                onChange={(e) => {
                  const nro = e.target.value;
                  setValue("nro_cuota", nro);
                  const cuotaSeleccionada = saldos.find(c => c.numero_cuota.toString() === nro);
                  setSaldoDisponible(cuotaSeleccionada?.saldo_cuota || 0);
                  setIdSaldo(cuotaSeleccionada?.id_saldo || null);
                }}
              >
                <option value="">Seleccione la cuota</option>
                {saldos.map((cuota) => (
                  <option
                    key={cuota.numero_cuota}
                    value={cuota.numero_cuota.toString()}
                    style={{ color: cuota.saldo_cuota === "0.00" ? "gray" : "black" }}
                  >
                    {`Cuota ${cuota.numero_cuota} – Saldo: Gs${cuota.saldo_cuota} ${cuota.saldo_cuota === "0.00" ? "(Pagada)" : ""}`}
                  </option>
                ))}
              </select>
              {errors.nro_cuota && <CampoRequerido />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Fecha</label>
                <input
                  type="date"
                  className="formulario-input w-full"
                  {...register("fecha_pago", {
                    required: true,
                    validate: (value) => {
                      const hoy = new Date();
                      const fecha = new Date(value);
                      hoy.setHours(0, 0, 0, 0);
                      fecha.setHours(0, 0, 0, 0);
                      return fecha <= hoy || "La fecha no puede ser futura.";
                    },
                  })}
                />
                {errors.fecha_pago && <CampoRequerido />}
                {errors.fecha_pago?.message && (
                  <span className="text-red-500 text-sm">{errors.fecha_pago.message}</span>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Total a pagar</label>
                <input
                  type="number"
                  className="formulario-input w-full"
                  placeholder="Ingrese el monto..."
                  {...register("total_pago", {
                    required: true,
                    valueAsNumber: true,
                    min: 1,
                    validate: (value) =>
                      value <= saldoDisponible ||
                      `El pago excede el saldo disponible (Gs${saldoDisponible})`,
                  })}
                />
                {errors.total_pago?.type === "required" && <CampoRequerido />}
                {errors.total_pago?.type === "min" && <ValidarNumero />}
                {errors.total_pago?.message && (
                  <span className="text-red-500 text-sm">{errors.total_pago.message}</span>
                )}
                <p className="text-sm text-gray-500 mt-1">Saldo disponible: Gs{saldoDisponible}</p>
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium">Observaciones</label>
              <textarea
                className="formulario-input w-full min-h-[100px]"
                {...register("observaciones", {
                  maxLength: 200,
                  onBlur: (e) => {
                    if (e.target.value === "") setValue("observaciones", "Pago a proveedor");
                  },
                })}
              ></textarea>
            </div>
          </fieldset>

          <div className="flex justify-center gap-3 mt-6">
            {puedeEscribir && !editable && (
              <button 
                onClick={habilitarEdicion} 
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                ✏️ Editar
              </button>
            )}
            {puedeEscribir && editable && (
              <button
                type="submit"
                form="editar-caja-pago"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                💾 Guardar
              </button>
            )}
            {params.id && puedeEscribir && (
              <button 
                onClick={descartarCajaPago} 
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                🗑️ Eliminar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}