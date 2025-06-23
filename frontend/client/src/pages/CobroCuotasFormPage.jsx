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
  actualizarCajaCobro,
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

  useEffect(() => {
    async function cargarInfantes() {
      const res = await obtenerInfantes();
      setInfantes(res.data);
    }
    cargarInfantes();
  }, []);

  useEffect(() => {
    if (infanteIdValue) {
      fetch(`http://localhost:8000/api/cuotas/infante/${infanteIdValue}/`)
        .then((res) => res.json())
        .then((data) => {
          setCuotas(data);
          setValue("cuota_id", "");
          setMontoTotal(0);
          setIdCuota(null);
        })
        .catch((e) => console.error("Error al cargar cuotas:", e));
    } else {
      setCuotas([]);
      setValue("cuota_id", "");
      setMontoTotal(0);
      setIdCuota(null);
    }
  }, [infanteIdValue, setValue]);

  useEffect(() => {
    async function cargarCobro() {
      if (id) {
        const { data } = await obtenerCajaCobro(id);
        setValue("fecha_cobro", data.fecha_cobro);
        setValue("monto_cobrado", parseFloat(data.monto_cobrado));
        setValue("metodo_pago", data.metodo_pago);
        setValue("observacion", data.observacion || "");
        setValue("infante_id", data.cuota.id_infante.id.toString());
        setValue("cuota_id", data.cuota_id.toString());

        const resCuotas = await fetch(`http://localhost:8000/api/cuotas/infante/${data.cuota.id_infante.id}/`);
        const dataCuotas = await resCuotas.json();
        setCuotas(dataCuotas);

        const cuota = dataCuotas.find((c) => c.id.toString() === data.cuota_id.toString());
        if (cuota) {
          const monto = parseFloat(cuota.monto_total || cuota.monto_cuota || 0);
          setMontoTotal(monto);
          setIdCuota(cuota.id);
        }
        setEditable(false);
      } else {
        reset({
          fecha_cobro: new Date().toISOString().slice(0, 10),
          monto_cobrado: 0,
          metodo_pago: "EFECTIVO",
          observacion: "",
          infante_id: "",
          cuota_id: "",
        });
        setEditable(true);
        setCuotas([]);
        setMontoTotal(0);
        setIdCuota(null);
      }
    }
    cargarCobro();
  }, [id, reset, setValue]);

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

  const onSubmit = handleSubmit(async (data) => {
    if (!idCuota) {
      alert("Debe seleccionar una cuota válida.");
      return;
    }

    const finalData = {
      cuota_id: parseInt(data.cuota_id),
      monto_cobrado: parseFloat(data.monto_cobrado),
      metodo_pago: data.metodo_pago,
      observacion: data.observacion?.trim() || "",
    };

    try {
      if (id) {
        await actualizarCajaCobro(id, finalData);
      } else {
        await crearCajaCobro(finalData);
      }
      navigate(pagina);
    } catch (error) {
      console.error("Error al guardar el cobro:", error.response?.data || error.message);
      alert("Error al guardar el cobro: " + (error.response?.data?.error || error.message));
    }
  });

  const puedeEscribir = tienePermiso("cajasCobros", "escritura");

  const descartarCobro = async () => {
    const confirmar = window.confirm("¿Deseas eliminar este cobro?");
    if (confirmar) {
      await eliminarCajaCobro(id);
      navigate(pagina);
    }
  };

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">Cobro de Cuota</h1>
        <form onSubmit={onSubmit} id="cobro-cuota">
          <fieldset disabled={!editable}>
            <h4 className="formulario-elemento">Infante</h4>
            <select
              className="formulario-input"
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
            {errors.infante_id && <CampoRequerido />}

            <h4 className="formulario-elemento">Cuota</h4>
            <select
              className="formulario-input"
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
            {errors.cuota_id && <CampoRequerido />}

            <h4 className="formulario-elemento">Monto a Cobrar</h4>
            <input
              type="number"
              className="formulario-input"
              readOnly
              {...register("monto_cobrado", {
                required: true,
                /*validate: (value) =>
                  value == montoTotal ||
                  `El monto debe ser exactamente Gs${montoTotal}`,*/
              })}
            />
            {errors.monto_cobrado?.type === "required" && <CampoRequerido />}
            {errors.monto_cobrado?.message && (
              <span className="mensaje-error">{errors.monto_cobrado.message}</span>
            )}
            <p className="text-sm text-gray-500">Monto total: Gs{montoTotal}</p>

            <h4 className="formulario-elemento">Método de Pago</h4>
            <select className="formulario-input" {...register("metodo_pago", { required: true })}>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="TARJETA">Tarjeta</option>
            </select>
            {errors.metodo_pago && <CampoRequerido />}

            <h4 className="formulario-elemento">Observación</h4>
            <textarea
              className="formulario-input"
              {...register("observacion", {
                maxLength: 200,
                onBlur: (e) => {
                  if (e.target.value === "") setValue("observacion", "");
                },
              })}
            ></textarea>
          </fieldset>
        </form>

        <div className="botones-grupo">
          {puedeEscribir && editable && (
            <button type="submit" form="cobro-cuota" className="boton-guardar">
              Guardar
            </button>
          )}
          {id && puedeEscribir && !editable && (
            <button onClick={descartarCobro} className="boton-eliminar">
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
