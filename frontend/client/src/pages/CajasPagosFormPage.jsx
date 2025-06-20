// FRONTEND - CajasPagosFormPage.jsx
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
    watch,
  } = useForm({
    defaultValues: {
      fecha_pago: new Date().toISOString().slice(0, 10),
    },
  });

  const [editable, setEditable] = useState(false);

  const [saldoDisponible, setSaldoDisponible] = useState(0);

  const [idSaldo, setIdSaldo] = useState(null);


  // Se agrega para elegir comprobantes
  const [comprobantes, setComprobantes] = useState([]);

  // Se agrega para saldos 
  const [saldos, setSaldos] = useState([]);

  const [montoMaximo, setMontoMaximo] = useState(null);

  const navigate = useNavigate();
  const pagina = "/caja-pagos";
  const params = useParams();

  useEffect(() => {
  async function cargarCajaPago() {
    if (params.id) {
      const { data } = await obtenerCajaPago(params.id);
      const comprobanteCaja = data.id_comprobante;
      const nroCuota = data.nro_cuota;

      setValue("fecha_pago", data.fecha_pago);
      setValue("total_pago", data.total_pago);
      setValue("observaciones", data.observaciones);

      // 1. Cargar comprobantes
      const resComprobantes = await fetch("http://localhost:8000/api/comprobantes-disponibles/");
      const dataComprobantes = await resComprobantes.json();
      setComprobantes(dataComprobantes);

      // 2. Esperar que el comprobante exista y setearlo
      const existeComprobante = dataComprobantes.some(c => c.id === comprobanteCaja);
      if (existeComprobante) {
        setValue("id_comprobante", comprobanteCaja.toString());
      }

      // 3. Cargar cuotas del comprobante
      const cuotasRes = await fetch(`http://localhost:8000/api/cuotas-disponibles?id_comprobante=${comprobanteCaja}`);
      if (!cuotasRes.ok) {
        const text = await cuotasRes.text();
        throw new Error(`Error al obtener cuotas: ${cuotasRes.status} - ${text}`);
      }
      const cuotas = await cuotasRes.json();
      setSaldos(cuotas);

      // 4. Buscar y setear la cuota correspondiente
      const cuotaMatch = cuotas.find((c) => c.numero_cuota === nroCuota);
      if (cuotaMatch) {
        setValue("nro_cuota", cuotaMatch.numero_cuota.toString());
        setSaldoDisponible(cuotaMatch.saldo_cuota);
        setIdSaldo(cuotaMatch.id_saldo);
      } else {
        console.warn("⚠️ No se encontró la cuota en las cuotas disponibles");
      }

      setEditable(false);
    } else {
      reset({
        fecha_pago: new Date().toISOString().slice(0, 10),
      });
      setEditable(true);

      const resComprobantes = await fetch("http://localhost:8000/api/comprobantes-pendientes/");
      const dataComprobantes = await resComprobantes.json();
      setComprobantes(dataComprobantes);
    }
  }

  cargarCajaPago();
}, [params.id, setValue, reset]);



// Cuando cambia el comprobante, se cargan las cuotas disponibles
useEffect(() => {
  const id_comprobante = watch("id_comprobante");

  if (id_comprobante) {
    fetch(`http://localhost:8000/api/cuotas-disponibles?id_comprobante=${id_comprobante}`)
      .then((res) => res.json())
      .then((data) => {
        setSaldos(data); // guarda las cuotas disponibles
        setValue("nro_cuota", ""); // reinicia la selección actual
        setSaldoDisponible(0); // limpia el saldo actual
      })
      .catch((error) => {
        console.error("Error al cargar cuotas:", error);
        setSaldos([]);
      });
  } else {
    setSaldos([]);
    setSaldoDisponible(0);
  }
}, [watch("id_comprobante")]);


  const onSubmit = handleSubmit(async (data) => {
  try {
    if (!idSaldo) {
      alert("No se ha seleccionado correctamente una cuota.");
      return;
    }

    data.id_saldo = idSaldo;

    if (params.id) {
      await actualizarCajaPago(params.id, data);
    } else {
      await crearCajaPago(data);
    }

    navigate(pagina);
  } catch (error) {
    console.error("Detalles del error:", error.response?.data || error.message);
  }
});


  const puedeEscribir = tienePermiso("cajasPagos", "escritura");

  const habilitarEdicion = () => setEditable(true);
  const descartarCajaPago = async () => {
    const aceptar = window.confirm("¿Estás seguro que quieres eliminar este pago?");
    if (aceptar) {
      await eliminarCajaPago(params.id);
      navigate(pagina);
    }
  };

  return (
        <div className="formulario">
      <div className="formulario-dentro">
        {/*Modificar el título según la página*/}
        <h1 className="formulario-titulo">Pago a Proveedor</h1>
        {/*Modificar el formulario de acuerdo a los campos necesarios*/}
        <form onSubmit={onSubmit} id="editar-caja-pago">
          {/*El fieldset permite bloquear la escritura*/}
          <fieldset disabled={!editable}>
            <h4 className="formulario-elemento">Comprobante</h4>
            <select
                  className="formulario-input"
                  {...register("id_comprobante", { required: true })}
              >
              <option value="">Seleccione el comprobante</option>
              {comprobantes
                //.filter((p) => p.estado) // solo activas
                .map((comprobante) => (
                <option key={comprobante.id} value={comprobante.id.toString()}>
                  {comprobante.descripcion}
                </option>
                ))}
            </select>
            {errors.id_comprobante && <CampoRequerido></CampoRequerido>}
            <h4 className="formulario-elemento">Cuota</h4>
            <select
                className="formulario-input"
                {...register("nro_cuota", { required: true })}
                onChange={(e) => {
                  const nro = parseInt(e.target.value);
                  const cuotaSeleccionada = saldos.find(c => c.numero_cuota === nro);

                  setSaldoDisponible(cuotaSeleccionada?.saldo_cuota || 0);
                  setIdSaldo(cuotaSeleccionada?.id_saldo || null); // 
                  setValue("nro_cuota", nro);
                }}
              >
                <option value="">Seleccione la cuota</option>
                {saldos.map((cuota) => (
                  <option key={cuota.numero_cuota} value={cuota.numero_cuota}>
                    Cuota {cuota.numero_cuota} – Saldo: Gs{cuota.saldo_cuota}
                  </option>
                ))}
              </select>


            <h4 className="formulario-elemento">Fecha</h4>
            <input
              type="date"
              className="formulario-input"
              {...register("fecha_pago", { required: true })}
            />
            {/*Mensaje de error si no se completa un campo obligatorio*/}
            {errors.fecha_pago && <CampoRequerido></CampoRequerido>}
            <h4 className="formulario-elemento">Total a pagar</h4>
            <input
              type="number"
              placeholder="Ingrese el total en números..."
              className="formulario-input"
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
              {...register("observaciones", { maxLength: 200 })}
            ></textarea>
          </fieldset>
        </form>

        <div className="botones-grupo">
          {puedeEscribir && !editable && (
            <button onClick={habilitarEdicion} className="boton-editar">Editar</button>
          )}
          {puedeEscribir && editable && (
            <button type="submit" form="editar-caja-pago" className="boton-guardar">Guardar</button>
          )}
          {params.id && puedeEscribir && editable && (
            <button onClick={descartarCajaPago} className="boton-eliminar">Eliminar</button>
          )}
        </div>
      </div>
    </div>
  );
}
