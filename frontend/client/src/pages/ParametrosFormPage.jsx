import { useForm } from "react-hook-form";
import { crearParametro,
         eliminarParametro,
         actualizarParametro,
         obtenerParametro
 } from "../api/parametros.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";
import ValidarDiaMes from "../components/ValidarDiaMes";
import ValidarNumero from "../components/ValidarNumero";

export function ParametrosFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm();

  //Desbloquea los campos,
  //  Ademas habilita los botones Guardar y Eliminar
  const [editable, setEditable] = useState(false);

  const navigate = useNavigate();
  // Modificar según la página padre
  const pagina = "/parametros";
  const params = useParams();

  //Diccionario para meses
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
        //Necesario para poder habilitar los campos si se tiene permiso
        setEditable(true);
      }
    }
    cargarParametro();
  }, [params.id, setValue, reset]);

  const onSubmit = handleSubmit(async (data) => {
    if (params.id) {
      await actualizarParametro(params.id, data);
    } else {
      await crearParametro(data);
    }
    navigate(pagina);
  });

  const habilitarEdicion = async () => {
    setEditable(true);
  };

  const descartarParametro = async () => {
    const aceptar = window.confirm(
      "¿Estás seguro que quieres eliminar el parámetro?"
    );
    if (aceptar) {
      await eliminarParametro(params.id);
      navigate(pagina);
    }
  };

  //                          campo que tiene que leer ---- permiso necesario
  const puedeEscribir = tienePermiso("parametros", "escritura");
  //const puedeLeer=tienePermiso("permisos","lectura");

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        {/*Modificar el título según la página*/}
        <h1 className="formulario-titulo">Parametro</h1>
        {/*Modificar el formulario de acuerdo a los campos necesarios*/}
        <form onSubmit={onSubmit} id="editar-parametro">
          {/*El fieldset permite bloquear la escritura*/}
          <fieldset disabled={!editable}>
            <h4 className="formulario-elemento">Año</h4>
            <input
              type="number"
              placeholder="Ingrese el año para generar las cuotas."
              className="formulario-input"
              {...register("anho", { required: true, valueAsNumber: true })}
            />
            {/*Mensaje de error si no se completa un campo obligatorio*/}
            {errors.anho && <CampoRequerido></CampoRequerido>}
            <h4 className="formulario-elemento">Mes de inicio</h4>
            <select 
                className="formulario-input"
                id= "mes_inicio"
                {...register("mes_inicio", {
                    valueAsNumber: true,
                    validate: (value) => value <= watch("mes_fin") || "El mes de inicio debe ser menor o igual al mes de fin",
                })}
                disabled={!editable}
            >
                <option value="">Seleccione un mes</option>
                {meses.map((mes) => (
                    <option key={mes.value} value={mes.value}>
                        {mes.label}
                    </option>
                ))}
            </select>
            {errors.mes_inicio && <CampoRequerido></CampoRequerido>}
            <h4 className="formulario-elemento">Mes final</h4>
            <select 
                className="formulario-input"
                id= "mes_fin"
                {...register("mes_fin", {valueAsNumber: true})}
                disabled={!editable}
            >
                <option value="">Seleccione un mes</option>
                {meses.map((mes) => (
                    <option key={mes.value} value={mes.value}>
                        {mes.label}
                    </option>
                ))}
            </select>
            {errors.mes_fin && <CampoRequerido></CampoRequerido>}

            <h4 className="formulario-elemento">Día de Vencimiento</h4>
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
            <span className="error-mensaje">
                {errors.dia_limite_pago.message || <CampoRequerido />}
            </span>
            )}
            <h4 className="formulario-elemento">Dias de Gracia</h4>
                        <input
                          type="number"
                          placeholder="Ingrese dias de gracia por retraso"
                          className="formulario-input"
                          {...register("dias_gracia", { 
                            required: "Este campo es obligatorio",
                            valueAsNumber: true,
                            min: { value: 1, message: "El valor debe ser mayor o igual a 1" },
                        })}
                        />
            {errors.dias_gracia && (
            <span className="error-mensaje">
                {errors.dias_gracia.message || <CampoRequerido />}
            </span>
            )}
            <h4 className="formulario-elemento">Monto de Cuota</h4>
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
            <span className="error-mensaje">
                {errors.monto_cuota.message || <CampoRequerido />}
            </span>
            )}
            <h4 className="formulario-elemento">Monto de Mora</h4>
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
                <span className="error-mensaje">
                    {errors.mora_por_dia.message || <CampoRequerido />}
                </span>
                )}

            <div className="flex items-center mt-2">
              <h4 className="formulario-elemento mb-0 mr-2">Activo: </h4>
              <input
                type="checkbox"
                {...register("estado", { required: false })}
              ></input>
            </div>
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
              form="editar-parametro"
              className="boton-guardar"
            >
              Guardar
            </button>
          )}
          <br />
          {params.id && puedeEscribir && editable && (
            <button onClick={descartarParametro} className="boton-eliminar">
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
