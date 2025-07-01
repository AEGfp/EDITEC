import { useForm , useWatch} from "react-hook-form";
import {
  crearComprobante,
  eliminarComprobante,
  actualizarComprobante,
  obtenerComprobante,
} from "../api/comprobante_proveedor.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";
import FormatoNumero from "../components/FormatoNumero";
import ValidarNumero from "../components/ValidarNumero";
import ValidarNumerosCero from "../components/ValidarNumerosCero";
import FormatoTimbrado from "../components/FormatoTimbrado";
import { eliminarSaldo } from "../api/saldo_proveedores.api";

export function ComprobantesFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    getValues,
    trigger,
    watch,
    control,
  } = useForm({
      defaultValues: {
        fecha_comprobante: new Date().toISOString().slice(0, 10),
        gravadas_10: 0,
        gravadas_5: 0,
        exentas: 0,
        total_comprobante: 0,
    },
  });

  //Desbloquea los campos,
  //  Ademas habilita los botones Guardar y Eliminar
  const [editable, setEditable] = useState(false);

  // Se agrega para elegir el proveedor relacionado
  const [proveedores, setProveedores] = useState([]);

  // Se agrega para elegir la sucursal relacionada
  const [sucursales, setSucursales] = useState([]);

  // Se agrega para elegir el tipo de comprobante relacionado
  const [tipos, setTipos] = useState([]);

  // Se agrega para elegir la condición relacionada
  const [condiciones, setCondiciones] = useState([]);

  const navigate = useNavigate();
  // Modificar según la página padre
  const pagina = "/comprobantes";
  const params = useParams();

  useEffect(() => {
  async function cargarComprobante() {
    if (params.id) {
      const { data } = await obtenerComprobante(params.id);
      console.log("Comprobante cargado:", data);

      // Guardamos temporalmente el proveedor del comprobante
      const proveedorComprobante = data.id_proveedor;

      // Guardamos temporalmente la sucursal del comprobante
      const sucursalComprobante = data.id_local;

      // Guardamos temporalmente el tipo de comprobante
      const tipoComprobante = data.id_tipo_comprobante;

      // Guardamos temporalmente la condicion de comprobante
      const condicionComprobante = data.id_condicion;

      setValue("concepto", data.concepto);
      setValue("fecha_comprobante", data.fecha_comprobante);
      setValue("total_comprobante", data.total_comprobante);
      setValue("numero_comprobante", data.numero_comprobante);
      setValue("timbrado", data.timbrado);
      setValue("gravadas_10", data.gravadas_10);
      setValue("gravadas_5", data.gravadas_5);
      setValue("exentas", data.exentas);

      // Cargamos los proveedores
      const resProveedores = await fetch("http://localhost:8000/api/proveedores/");
      const dataProveedores = await resProveedores.json();
      setProveedores(dataProveedores);

      // Ahora que ya hay opciones, seteamos el valor
      setValue("id_proveedor", proveedorComprobante.toString());

      // Cargamos las sucursales
      const resSucursales = await fetch("http://localhost:8000/api/locales/");
      const dataSucursales = await resSucursales.json();
      setSucursales(dataSucursales);

      // Ahora que ya hay opciones, seteamos el valor
      setValue("id_local", sucursalComprobante.toString());

      // Cargamos los tipos de comprobantes
      const resTipos = await fetch("http://localhost:8000/api/tipo-comprobantes/");
      const dataTipos = await resTipos.json();
      setTipos(dataTipos);

      // Ahora que ya hay opciones, seteamos el valor
      setValue("id_tipo_comprobante", tipoComprobante.toString());

      // Cargamos las condiciones
      const resCondiciones = await fetch("http://localhost:8000/api/condiciones/");
      const dataCondiciones = await resCondiciones.json();
      setCondiciones(dataCondiciones);

      // Ahora que ya hay opciones, seteamos el valor
      setValue("id_condicion", condicionComprobante.toString());

    } else {
      reset();
      setEditable(true);
      // Se cargan los proveedores si no hay params.id
      const resProveedores = await fetch("http://localhost:8000/api/proveedores/");
      const dataProveedores = await resProveedores.json();
      setProveedores(dataProveedores);

      // Se cargan las sucursales si no hay params.id
      const resSucursales = await fetch("http://localhost:8000/api/locales/");
      const dataSucursales = await resSucursales.json();
      setSucursales(dataSucursales);

      // Se cargan los tipos de comprobantes si no hay params.id
      const resTipos = await fetch("http://localhost:8000/api/tipo-comprobantes/");
      const dataTipos = await resTipos.json();
      setTipos(dataTipos);

      // Se cargan las condiciones si no hay params.id
      const resCondiciones = await fetch("http://localhost:8000/api/condiciones/");
      const dataCondiciones = await resCondiciones.json();
      setCondiciones(dataCondiciones);
    }
  }
  cargarComprobante();
}, [params.id]);

  const onSubmit = handleSubmit(async (data) => {
    const finalData = {
    ...data,
    gravadas_10: data.gravadas_10 || 0,
    gravadas_5: data.gravadas_5 || 0,
    exentas: data.exentas || 0,
    total_comprobante: data.gravadas_10 + data.gravadas_5 + data.exentas || 0,
    };
    try {
      if (params.id) {
        console.log("Payload a enviar actualizar:", finalData);
        await actualizarComprobante(params.id, finalData);
      } else {
        console.log("Payload a enviar crear:", finalData);
        await crearComprobante(finalData);
      }
      navigate(pagina);
    } catch (error) {
      console.error("Detalles del error:", error.response?.data || error.message);
    }
  });
 
  const habilitarEdicion = async () => {
    setEditable(true);
  };

  const descartarComprobante = async () => {
    const aceptar = window.confirm(
      "¿Estás seguro que quieres eliminar este comprobante?"
    );
    if (aceptar) {
      await eliminarComprobante(params.id);
      navigate(pagina);
    }
  };

  //                          campo que tiene que leer ---- permiso necesario
  const puedeEscribir = tienePermiso("comprobantes", "escritura");
  //const puedeLeer=tienePermiso("permisos","lectura");

  // Se captan los campos para la suma
  const gravadas10 = useWatch({ control, name: "gravadas_10" });
  const gravadas5 = useWatch({ control, name: "gravadas_5" });
  const exentas = useWatch({ control, name: "exentas" });

  // Efecto para actualizar total_comprobante cuando cambien los campos
  useEffect(() => {
    const total = (gravadas10 || 0) + (gravadas5 || 0) + (exentas || 0);
    setValue("total_comprobante", total, { shouldValidate: true });
  }, [gravadas10, gravadas5, exentas, setValue]);

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        {/*Modificar el título según la página*/}
        <h1 className="formulario-titulo">Comprobante de Gasto</h1>
        {/*Modificar el formulario de acuerdo a los campos necesarios*/}
        <form onSubmit={onSubmit} id="editar-comprobante">
          {/*El fieldset permite bloquear la escritura*/}
          <fieldset disabled={!editable}>
            <h4 className="formulario-elemento">Proveedor</h4>
            <select
                  className="formulario-input"
                  {...register("id_proveedor", { required: true })}
              >
              <option value="">Seleccione el proveedor</option>
              {proveedores
                .filter((p) => p.estado) // solo activas
                .map((proveedor) => (
                <option key={proveedor.id} value={proveedor.id.toString()}>
                  {proveedor.nombre_fantasia}
                </option>
                ))}
            </select>
            {errors.id_proveedor && <CampoRequerido></CampoRequerido>}
            <h4 className="formulario-elemento">Sucursal</h4>
            <select
                  className="formulario-input"
                  {...register("id_local", { required: true })}
              >
              <option value="">Seleccione la sucursal</option>
              {sucursales
                .filter((s) => s.estado) // solo activas
                .map((sucursal) => (
                <option key={sucursal.id} value={sucursal.id.toString()}>
                  {sucursal.descripcion}
                </option>
                ))}
            </select>
            {errors.id_local && <CampoRequerido></CampoRequerido>}
            <h4 className="formulario-elemento">Tipo de comprobante</h4>
            <select
                  className="formulario-input"
                  {...register("id_tipo_comprobante", { required: true })}
              >
              <option value="">Seleccione el tipo de comprobante</option>
              {tipos
                .filter((t) => t.estado) // solo activas
                .map((tipo) => (
                <option key={tipo.id} value={tipo.id.toString()}>
                  {tipo.descripcion}
                </option>
                ))}
            </select>
            {errors.id_tipo_comprobante && <CampoRequerido></CampoRequerido>}
            <h4 className="formulario-elemento">Condición</h4>
            <select
                  className="formulario-input"
                  {...register("id_condicion", { required: true })}
              >
              <option value="">Seleccione la condición</option>
              {condiciones
                .filter((c) => c.estado) // solo activas
                .map((condicion) => (
                <option key={condicion.id} value={condicion.id.toString()}>
                  {condicion.descripcion}
                </option>
                ))}
            </select>
            {errors.id_condicion && <CampoRequerido></CampoRequerido>}
            <h4 className="formulario-elemento">Número Comprobante</h4>
            <input
              type="text"
              placeholder="xxx-xxx-xxxxxxx"
              className="formulario-input"
              {...register("numero_comprobante", { required: true })}
              {...register("numero_comprobante", {
                            required: true,
                            pattern: {
                                value: /^\d{3}-\d{3}-\d{7}$/},
                            },{
                            maxLength: {
                                value: 15,
                            },
               })}
            />
            {/*Mensaje de error si no se completa un campo obligatorio*/}
            {errors.numero_comprobante?.type === "required" && <CampoRequerido />}
            {errors.numero_comprobante?.type === "pattern" && <FormatoNumero />}
            {/*errors.numero_comprobante?.type === "maxLength" && <ValidarNumero />*/} 
            <h4 className="formulario-elemento">N° Timbrado</h4>
              <input
                type="number"
                placeholder="Ingrese el timbrado del comprobante..."
                className="formulario-input"
                {...register("timbrado", { 
                  required: "El timbrado es obligatorio",
                  valueAsNumber: true,
                  validate: {
                    length: (value) => {
                      const strValue = String(value);
                      return /^\d{8}$/.test(strValue) || "El timbrado debe tener exactamente 8 dígitos numéricos";
                    },
                  },
                })}
              />
              {errors.timbrado && (
                <CampoRequerido mensaje={errors.timbrado.message} />
              )}
                          
            <h4 className="formulario-elemento">Concepto</h4>
            <input
              type="text"
              placeholder="Ingrese un concepto para el comprobante..."
              className="formulario-input"
              {...register("concepto", { required: true })}
            />
            <h4 className="formulario-elemento">Fecha</h4>
            <input
              type="date"
              className="formulario-input"
              {...register("fecha_comprobante", { 
                required: true,
               validate: (value) => {
                const hoy = new Date();
                const fechaIngresada = new Date(value);
                // Quitar hora para comparar solo fechas (opcional pero recomendable)
                hoy.setHours(0, 0, 0, 0);
                fechaIngresada.setHours(0, 0, 0, 0);
                return fechaIngresada <= hoy || "La fecha del comprobante no puede ser futura";
               }
              })}
            />
            {/*Mensaje de error si no se completa un campo obligatorio*/}
            {errors.fecha_comprobante && <CampoRequerido></CampoRequerido>}
            {errors.fecha_comprobante?.message && (
              <span className="text-red-500 text-sm">{errors.fecha_comprobante.message}</span>
            )}
            <h3 className="subtitulo-formulario">Subtotales</h3>
            <div className="fila-campos">
                <div className="w-1/3">
                  <h4 className="formulario-elemento">Gravadas 10</h4>
                  <input
                    type="number"
                    placeholder="Ingrese las gravadas del 10%..."
                    className="formulario-input"
                    {...register("gravadas_10", { 
                      required: true , 
                      valueAsNumber: true, 
                      min: { value: 0},
                      onBlur: (e) => {
                        //Si el usuario borra el cero por defecto y deja vacio, completa otra vez con cero
                        if (e.target.value === "") setValue("gravadas_10", 0);
                        //si cambia algo vuelve a verificar totales
                        trigger("total_comprobante");
                      }  
                    })}
                  />
                  {/*errors.gravadas_10?.type === "required" && <CampoRequerido />*/}
                  {errors.gravadas_10?.type === "min" && <ValidarNumerosCero />}
                </div>
                <div className="w-1/3">
                  <h4 className="formulario-elemento">Gravadas 5</h4>
                  <input
                    type="number"
                    placeholder="Ingrese las gravadas del 5%..."
                    className="formulario-input"
                    {...register("gravadas_5", { 
                      required: true , 
                      valueAsNumber: true, 
                      min: { value: 0},
                      onBlur: (e) => {
                        //Si el usuario borra el cero por defecto y deja vacio, completa otra vez con cero
                        if (e.target.value === "") setValue("gravadas_5", 0);
                        //si cambia algo vuelve a verificar totales
                        trigger("total_comprobante");
                      }
                    })}
                  />
                  {/*errors.gravadas_5?.type === "required" && <CampoRequerido />*/}
                  {errors.gravadas_5?.type === "min" && <ValidarNumerosCero />}
                </div>  
                  <div className="w-1/3">
                  <h4 className="formulario-elemento">Exentas</h4>
                  <input
                    type="number"
                    placeholder="Ingrese el total de exentas..."
                    className="formulario-input"
                    {...register("exentas", { 
                      required: true , 
                      valueAsNumber: true, 
                      min: { value: 0},
                      onBlur: (e) => {
                        //Si el usuario borra el cero por defecto y deja vacio, completa otra vez con cero
                        if (e.target.value === "") setValue("exentas", 0);
                        //si cambia algo vuelve a verificar totales
                        trigger("total_comprobante");
                      }
                    })}
                  />
                  {/*errors.exentas?.type === "required" && <CampoRequerido />*/}
                  {errors.exentas?.type === "min" && <ValidarNumerosCero />}
                </div>
            </div>
            <h4 className="formulario-elemento">Total</h4>
            <input
              type="number"
              readOnly
              placeholder="Ingrese el total en números..."
              className="formulario-input"
              
              {...register("total_comprobante", { 
                required: true , 
                valueAsNumber: true, 
                min: { value: 1},
                
            })}
            />
            {errors.total_comprobante?.type === "required" && <CampoRequerido />}
            {/*errors.total_comprobante?.type === "min" && <ValidarNumero />*/}
            {errors.total_comprobante?.message && (
              <span className="text-red-500 text-sm">{errors.total_comprobante.message}</span>
            )}
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
