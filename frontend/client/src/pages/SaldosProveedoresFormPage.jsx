import { useForm } from "react-hook-form";
import {
  crearSaldo,
  eliminarSaldo,
  actualizarSaldo,
  obtenerSaldo,
} from "../api/saldo_proveedores.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import tienePermiso from "../utils/tienePermiso";

export function ComprobantesFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  //Desbloquea los campos,
  //  Ademas habilita los botones Guardar y Eliminar
  //const [editable, setEditable] = useState(false);

  const navigate = useNavigate();
  // Modificar según la página padre
  const pagina = "/saldos";
  const params = useParams();

  useEffect(() => {
  async function cargarSaldo() {
    if (params.id) {
      const { data } = await obtenerSaldo(params.id);
      console.log("Saldo cargado:", data);

      // Guardamos temporalmente el comprobante
      const comprobanteSaldo = data.id_comprobante;

      setValue("monto_cuota", data.monto_cuota);
      setValue("saldo_cuota", data.saldo_cuota);
      setValue("fecha_pago", data.fecha_pago);
      setValue("numero_cuota", data.numero_cuota);

      // Cargamos los comprobantes
      const resComprobantes = await fetch("http://localhost:8000/api/comprobantes/");
      const dataComprobantes = await resComprobantes.json();
      setComprobantes(dataComprobantes);

      // Ahora que ya hay opciones, seteamos el valor
      setValue("id_comprobante", comprobanteSaldo.toString());

    } else {
      reset();
      setEditable(true);
      // Se cargan los comprobantes si no hay params.id
      const resComprobantes = await fetch("http://localhost:8000/api/comprobantes/");
      const dataComprobantes = await resComprobantes.json();
      setComprobantes(dataComprobantes);
    }
  }
  cargarSaldo();
}, [params.id]);

  /*const onSubmit = handleSubmit(async (data) => {
    try{
    if (params.id) {
      console.log("Payload a enviar actualizar:", data);
      await actualizarComprobante(params.id, data);
    } else {
      console.log("Payload a enviar crear:", data);
      await crearComprobante(data);
    }
    navigate(pagina);
}catch (error){
    console.error("Detalles del error:", error.response?.data || error.message);
}
  });*/

  const habilitarEdicion = async () => {
    setEditable(true);
  };

  const descartarSaldo = async () => {
    const aceptar = window.confirm(
      "¿Estás seguro que quieres eliminar este saldo?"
    );
    if (aceptar) {
      await eliminarSaldo(params.id);
      navigate(pagina);
    }
  };

  //                          campo que tiene que leer ---- permiso necesario
  const puedeEscribir = tienePermiso("saldos", "escritura");
  //const puedeLeer=tienePermiso("permisos","lectura");

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        {/*Modificar el título según la página*/}
        <h1 className="formulario-titulo">Saldo de Proveedores</h1>
        {/*Modificar el formulario de acuerdo a los campos necesarios*/}
        <form onSubmit={onSubmit} id="editar-saldo">
          {/*El fieldset permite bloquear la escritura*/}
          <fieldset disabled={!editable}>
            <h4 className="formulario-elemento">Comprobante</h4>
            <select
                  className="formulario-input"
                  {...register("id_comprobante", { required: true })}
              >
              <option value="">Comprobante asociado </option>
              {comprobantes
                .map((comprobante) => (
                <option key={comprobante.id} value={comprobante.id.toString()}>
                  {comprobante.numero_comprobante}
                </option>
                ))}
            </select>
            {errors.id_comprobante && <CampoRequerido></CampoRequerido>}
            <h4 className="formulario-elemento">Monto Cuota</h4>
            <input
              type="number"
              placeholder="Total de la cuota..."
              className="formulario-input"
              {...register("monto_cuota", { required: true , valueAsNumber: true, min: { value: 1},})}
            />
            {errors.monto_cuota?.type === "required" && <CampoRequerido />}
            {errors.monto_cuota?.type === "min" && <ValidarNumero />}
            <h4 className="formulario-elemento">Saldo Cuota</h4>
            <input
              type="number"
              placeholder="Total del saldo de la cuota..."
              className="formulario-input"
              {...register("saldo_cuota", { required: true , valueAsNumber: true, min: { value: 1},})}
            />
            {errors.saldo_cuota?.type === "required" && <CampoRequerido />}
            {errors.saldo_cuota?.type === "min" && <ValidarNumero />}
          </fieldset>
        </form>

        {/*Los botones se activan y desactiva dependiendo del rol
        y de la opcion*/}
        <div className="botones-grupo">
          {puedeEscribir && !editable && (
            <button onClick={habilitarEdicion} className="boton-editar">
              {" "}
              Editar
            </button>
          )}
          {puedeEscribir && editable && (
            <button
              type="submit"
              form="editar-comprobante"
              className="boton-guardar"
            >
              Guardar
            </button>
          )}
          <br />
          {params.id && puedeEscribir && editable && (
            <button onClick={descartarComprobante} className="boton-eliminar">
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
