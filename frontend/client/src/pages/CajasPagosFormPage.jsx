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

  // Para manejar select nro_cuota controlado
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

      // Aquí agregamos mostrar_todas=true para cuotas
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

      // Aquí solo cuotas con saldo (no enviamos mostrar_todas)
      setSaldos([]);
      setSaldoDisponible(0);
      setIdSaldo(null);
    }
  }
  cargarCajaPago();
}, [params.id, reset, setValue]);



  // Cuando cambia comprobante, cargar cuotas y resetear cuota y saldo
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
    <div className="formulario">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">Pago a Proveedor</h1>
        <form onSubmit={onSubmit} id="editar-caja-pago">
          <fieldset disabled={!editable}>
            <h4 className="formulario-elemento">Comprobante</h4>
            <select
              className="formulario-input"
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

            <h4 className="formulario-elemento">Cuota</h4>
            <select
              className="formulario-input"
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


            <h4 className="formulario-elemento">Fecha</h4>
            <input
              type="date"
              className="formulario-input"
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

            <h4 className="formulario-elemento">Total a pagar</h4>
            <input
              type="number"
              className="formulario-input"
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
              <span className="mensaje-error">{errors.total_pago.message}</span>
            )}
            <p className="text-sm text-gray-500">Saldo disponible: Gs{saldoDisponible}</p>

            <h4 className="formulario-elemento">Observaciones</h4>
            <textarea
              className="formulario-input"
              {...register("observaciones", {
                maxLength: 200,
                onBlur: (e) => {
                  if (e.target.value === "") setValue("observaciones", "Pago a proveedor");
                },
              })}
            ></textarea>
          </fieldset>
        </form>

        <div className="botones-grupo">
          {puedeEscribir && editable && (
            <button type="submit" form="editar-caja-pago" className="boton-guardar">
              Guardar
            </button>
          )}
          {params.id && puedeEscribir && !editable && (
            <button onClick={descartarCajaPago} className="boton-eliminar">
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
