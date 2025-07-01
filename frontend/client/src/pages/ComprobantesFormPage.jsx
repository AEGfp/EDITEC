import { useForm, useWatch } from "react-hook-form";
import {
  crearComprobante,
  eliminarComprobante,
  actualizarComprobante,
  obtenerComprobante,
} from "../api/comprobante_proveedor.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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

  const [editable, setEditable] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [condiciones, setCondiciones] = useState([]);

  const navigate = useNavigate();
  const pagina = "/comprobantes";
  const params = useParams();

  useEffect(() => {
    async function cargarComprobante() {
      if (params.id) {
        const { data } = await obtenerComprobante(params.id);
        console.log("Comprobante cargado:", data);

        const proveedorComprobante = data.id_proveedor;
        const sucursalComprobante = data.id_local;
        const tipoComprobante = data.id_tipo_comprobante;
        const condicionComprobante = data.id_condicion;

        setValue("concepto", data.concepto);
        setValue("fecha_comprobante", data.fecha_comprobante);
        setValue("total_comprobante", data.total_comprobante);
        setValue("numero_comprobante", data.numero_comprobante);
        setValue("timbrado", data.timbrado);
        setValue("gravadas_10", data.gravadas_10);
        setValue("gravadas_5", data.gravadas_5);
        setValue("exentas", data.exentas);

        const resProveedores = await fetch("http://localhost:8000/api/proveedores/");
        const dataProveedores = await resProveedores.json();
        setProveedores(dataProveedores);
        setValue("id_proveedor", proveedorComprobante.toString());

        const resSucursales = await fetch("http://localhost:8000/api/locales/");
        const dataSucursales = await resSucursales.json();
        setSucursales(dataSucursales);
        setValue("id_local", sucursalComprobante.toString());

        const resTipos = await fetch("http://localhost:8000/api/tipo-comprobantes/");
        const dataTipos = await resTipos.json();
        setTipos(dataTipos);
        setValue("id_tipo_comprobante", tipoComprobante.toString());

        const resCondiciones = await fetch("http://localhost:8000/api/condiciones/");
        const dataCondiciones = await resCondiciones.json();
        setCondiciones(dataCondiciones);
        setValue("id_condicion", condicionComprobante.toString());

      } else {
        reset();
        setEditable(true);
        
        const resProveedores = await fetch("http://localhost:8000/api/proveedores/");
        const dataProveedores = await resProveedores.json();
        setProveedores(dataProveedores);

        const resSucursales = await fetch("http://localhost:8000/api/locales/");
        const dataSucursales = await resSucursales.json();
        setSucursales(dataSucursales);

        const resTipos = await fetch("http://localhost:8000/api/tipo-comprobantes/");
        const dataTipos = await resTipos.json();
        setTipos(dataTipos);

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

  const puedeEscribir = tienePermiso("comprobantes", "escritura");

  const gravadas10 = useWatch({ control, name: "gravadas_10" });
  const gravadas5 = useWatch({ control, name: "gravadas_5" });
  const exentas = useWatch({ control, name: "exentas" });

  useEffect(() => {
    const total = (gravadas10 || 0) + (gravadas5 || 0) + (exentas || 0);
    setValue("total_comprobante", total, { shouldValidate: true });
  }, [gravadas10, gravadas5, exentas, setValue]);

  return (
    <div className="min-h-screen bg-blue-50 flex justify-center items-center py-10">
      <div className="bg-white rounded-xl shadow-md w-full max-w-4xl p-6">
        <div className="bg-blue-100 rounded-md px-4 py-2 mb-6 text-center">
          <h2 className="text-lg font-bold text-blue-700 flex items-center justify-center gap-2">
            📄 {params.id ? "Comprobante" : "Nuevo Comprobante"}
          </h2>
        </div>

        <form onSubmit={onSubmit} id="editar-comprobante" className="space-y-4">
          <fieldset disabled={!editable} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Proveedor</label>
                <select
                  className="formulario-input w-full"
                  {...register("id_proveedor", { required: true })}
                >
                  <option value="">Seleccione el proveedor</option>
                  {proveedores
                    .filter((p) => p.estado)
                    .map((proveedor) => (
                      <option key={proveedor.id} value={proveedor.id.toString()}>
                        {proveedor.nombre_fantasia}
                      </option>
                    ))}
                </select>
                {errors.id_proveedor && <CampoRequerido />}
              </div>

              <div>
                <label className="block mb-1 font-medium">Sucursal</label>
                <select
                  className="formulario-input w-full"
                  {...register("id_local", { required: true })}
                >
                  <option value="">Seleccione la sucursal</option>
                  {sucursales
                    .filter((s) => s.estado)
                    .map((sucursal) => (
                      <option key={sucursal.id} value={sucursal.id.toString()}>
                        {sucursal.descripcion}
                      </option>
                    ))}
                </select>
                {errors.id_local && <CampoRequerido />}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Tipo de comprobante</label>
                <select
                  className="formulario-input w-full"
                  {...register("id_tipo_comprobante", { required: true })}
                >
                  <option value="">Seleccione el tipo</option>
                  {tipos
                    .filter((t) => t.estado)
                    .map((tipo) => (
                      <option key={tipo.id} value={tipo.id.toString()}>
                        {tipo.descripcion}
                      </option>
                    ))}
                </select>
                {errors.id_tipo_comprobante && <CampoRequerido />}
              </div>

              <div>
                <label className="block mb-1 font-medium">Condición</label>
                <select
                  className="formulario-input w-full"
                  {...register("id_condicion", { required: true })}
                >
                  <option value="">Seleccione la condición</option>
                  {condiciones
                    .filter((c) => c.estado)
                    .map((condicion) => (
                      <option key={condicion.id} value={condicion.id.toString()}>
                        {condicion.descripcion}
                      </option>
                    ))}
                </select>
                {errors.id_condicion && <CampoRequerido />}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Número Comprobante</label>
                <input
                  type="text"
                  placeholder="xxx-xxx-xxxxxxx"
                  className="formulario-input w-full"
                  {...register("numero_comprobante", { 
                    required: true,
                    pattern: /^\d{3}-\d{3}-\d{7}$/,
                    maxLength: 15
                  })}
                />
                {errors.numero_comprobante?.type === "required" && <CampoRequerido />}
                {errors.numero_comprobante?.type === "pattern" && <FormatoNumero />}
              </div>

              <div>
                <label className="block mb-1 font-medium">N° Timbrado</label>
                <input
                  type="number"
                  placeholder="Ingrese el timbrado"
                  className="formulario-input w-full"
                  {...register("timbrado", { 
                    required: "El timbrado es obligatorio",
                    valueAsNumber: true,
                    validate: {
                      length: (value) => {
                        const strValue = String(value);
                        return /^\d{8}$/.test(strValue) || "Debe tener 8 dígitos";
                      },
                    },
                  })}
                />
                {errors.timbrado && (
                  <CampoRequerido mensaje={errors.timbrado.message} />
                )}
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium">Concepto</label>
              <input
                type="text"
                placeholder="Ingrese un concepto"
                className="formulario-input w-full"
                {...register("concepto", { required: true })}
              />
              {errors.concepto && <CampoRequerido />}
            </div>

            <div>
              <label className="block mb-1 font-medium">Fecha</label>
              <input
                type="date"
                className="formulario-input w-full"
                {...register("fecha_comprobante", { 
                  required: true,
                  validate: (value) => {
                    const hoy = new Date();
                    const fechaIngresada = new Date(value);
                    hoy.setHours(0, 0, 0, 0);
                    fechaIngresada.setHours(0, 0, 0, 0);
                    return fechaIngresada <= hoy || "La fecha no puede ser futura";
                  }
                })}
              />
              {errors.fecha_comprobante && <CampoRequerido />}
              {errors.fecha_comprobante?.message && (
                <span className="text-red-500 text-sm">{errors.fecha_comprobante.message}</span>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-blue-700">Subtotales</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Gravadas 10%</label>
                  <input
                    type="number"
                    className="formulario-input w-full"
                    {...register("gravadas_10", { 
                      required: true, 
                      valueAsNumber: true, 
                      min: 0,
                      onBlur: (e) => {
                        if (e.target.value === "") setValue("gravadas_10", 0);
                        trigger("total_comprobante");
                      }  
                    })}
                  />
                  {errors.gravadas_10?.type === "min" && <ValidarNumerosCero />}
                </div>

                <div>
                  <label className="block mb-1 font-medium">Gravadas 5%</label>
                  <input
                    type="number"
                    className="formulario-input w-full"
                    {...register("gravadas_5", { 
                      required: true, 
                      valueAsNumber: true, 
                      min: 0,
                      onBlur: (e) => {
                        if (e.target.value === "") setValue("gravadas_5", 0);
                        trigger("total_comprobante");
                      }
                    })}
                  />
                  {errors.gravadas_5?.type === "min" && <ValidarNumerosCero />}
                </div>  

                <div>
                  <label className="block mb-1 font-medium">Exentas</label>
                  <input
                    type="number"
                    className="formulario-input w-full"
                    {...register("exentas", { 
                      required: true, 
                      valueAsNumber: true, 
                      min: 0,
                      onBlur: (e) => {
                        if (e.target.value === "") setValue("exentas", 0);
                        trigger("total_comprobante");
                      }
                    })}
                  />
                  {errors.exentas?.type === "min" && <ValidarNumerosCero />}
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium">Total</label>
              <input
                type="number"
                readOnly
                className="formulario-input w-full bg-gray-100"
                {...register("total_comprobante", { 
                  required: true, 
                  valueAsNumber: true, 
                  min: 1,
                })}
              />
              {errors.total_comprobante?.type === "required" && <CampoRequerido />}
              {errors.total_comprobante?.message && (
                <span className="text-red-500 text-sm">{errors.total_comprobante.message}</span>
              )}
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
                form="editar-comprobante"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                💾 Guardar
              </button>
            )}
            {params.id && puedeEscribir && editable && (
              <button 
                onClick={descartarComprobante} 
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