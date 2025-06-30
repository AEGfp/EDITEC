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
    <div className="formulario">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">Cobro de Cuota</h1>
        <form onSubmit={onSubmit} id="cobro-cuota">
          <fieldset disabled={!editable}>
            <h4 className="formulario-elemento">Infante</h4>
            {editable ? (
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
            ) : (
              <input
                type="text"
                className="formulario-input"
                readOnly
                {...register("infante_nombre")}
              />
            )}
            {errors.infante_id && editable && <CampoRequerido />}
            {errors.infante_nombre && !editable && <CampoRequerido />}

            <h4 className="formulario-elemento">Cuota</h4>
            {editable ? (
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
            ) : (
              <input
                type="text"
                className="formulario-input"
                readOnly
                {...register("cuota_detalle")}
              />
            )}
            {errors.cuota_id && editable && <CampoRequerido />}
            {errors.cuota_detalle && !editable && <CampoRequerido />}

            <h4 className="formulario-elemento">Monto a Cobrar</h4>
            <input
              type="number"
              className="formulario-input"
              readOnly={!editable}
              {...register("monto_cobrado", {
                required: true,
              })}
            />
            {errors.monto_cobrado?.type === "required" && <CampoRequerido />}
            <p className="text-sm text-gray-500">Monto total: Gs{montoTotal}</p>

            <h4 className="formulario-elemento">Método de Pago</h4>
            {editable ? (
              <select className="formulario-input" {...register("metodo_pago", { required: true })}>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="TARJETA">Tarjeta</option>
              </select>
            ) : (
              <input
                type="text"
                className="formulario-input"
                readOnly
                {...register("metodo_pago")}
              />
            )}
            {errors.metodo_pago && <CampoRequerido />}

            <h4 className="formulario-elemento">Observación</h4>
            <textarea
              className="formulario-input"
              readOnly={!editable}
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
          {!id && puedeEscribir && editable && (
            <button type="submit" form="cobro-cuota" className="boton-guardar">
              Guardar
            </button>
          )}
          {id && puedeEscribir && (
            <button onClick={descartarCobro} className="boton-eliminar">
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}