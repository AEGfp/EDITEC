import { useForm } from "react-hook-form";
import {
  crearProveedor,
  eliminarProveedor,
  actualizarProveedor,
  obtenerProveedor,
} from "../api/proveedores.api";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import tienePermiso from "../utils/tienePermiso";
import CampoRequerido from "../components/CampoRequerido";

export function ProveedoresFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  //Desbloquea los campos,
  //  Ademas habilita los botones Guardar y Eliminar
  const [editable, setEditable] = useState(false);

  // Se agrega para elegir la persona relacionada
  const [personas, setPersonas] = useState([]);

  const navigate = useNavigate();
  // Modificar según la página padre
  const pagina = "/proveedores";
  const params = useParams();

  useEffect(() => {
  async function cargarProveedor() {
    if (params.id) {
      const { data } = await obtenerProveedor(params.id);
      console.log("Proveedor cargado:", data);

      // Guardamos temporalmente la persona del proveedor
      const personaProveedor = data.id_persona;

      setValue("nombre_fantasia", data.nombre_fantasia);
      setValue("ruc", data.ruc);
      setValue("estado", data.estado);
      setValue("telefono", data.telefono);
      setValue("observaciones", data.observaciones);

      // Cargamos las personas
      const resPersonas = await fetch("http://localhost:8000/api/personas/");
      const dataPersonas = await resPersonas.json();
      setPersonas(dataPersonas);

      // Ahora que ya hay opciones, seteamos el valor
      setValue("id_persona", personaProveedor.toString());

    } else {
      reset();
      setEditable(true);
      // También deberías cargar las empresas si no hay params.id
      const resPersonas = await fetch("http://localhost:8000/api/personas/");
      const dataPersonas = await resPersonas.json();
      setPersonas(dataPersonas);
    }
  }
  cargarProveedor();
}, [params.id]);

  const onSubmit = handleSubmit(async (data) => {
    if (params.id) {
      console.log("Payload a enviar actualizar:", data);
      await actualizarProveedor(params.id, data);
    } else {
      console.log("Payload a enviar crear:", data);
      await crearProveedor(data);
    }
    navigate(pagina);
  });

  const habilitarEdicion = async () => {
    setEditable(true);
  };

  const descartarProveedor = async () => {
    const aceptar = window.confirm(
      "¿Estás seguro que quieres eliminar este proveedor?"
    );
    if (aceptar) {
      await eliminarProveedor(params.id);
      navigate(pagina);
    }
  };

  //                          campo que tiene que leer ---- permiso necesario
  const puedeEscribir = tienePermiso("proveedores", "escritura");
  //const puedeLeer=tienePermiso("permisos","lectura");

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md border border-blue-100">
        <h2 className="text-xl font-semibold text-blue-800 bg-blue-100 px-4 py-2 rounded mb-6 flex items-center">
          🧾 {params.id ? "Proveedor" : "Nuevo Proveedor"}
        </h2>

        <form onSubmit={onSubmit} id="editar-proveedor">
  <fieldset disabled={!editable} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-black">Nombre Fantasía</label>
      <input
        type="text"
        placeholder="Ingrese el nombre de fantasía..."
        className="formulario-input w-full"
        {...register("nombre_fantasia", { required: true })}
      />
      {errors.nombre_fantasia && <CampoRequerido />}
    </div>

    <div>
      <label className="block text-sm font-medium text-black">Persona asociada</label>
      <select
        className="formulario-input w-full"
        {...register("id_persona", { required: true })}
      >
        <option value="">Seleccione una persona</option>
        {personas.map((persona) => (
          <option key={persona.id} value={persona.id.toString()}>
            {persona.nombre}
          </option>
        ))}
      </select>
      {errors.id_persona && <CampoRequerido />}
    </div>

    <div>
      <label className="block text-sm font-medium text-black">RUC</label>
      <input
        type="text"
        placeholder="Ingrese el RUC del proveedor..."
        className="formulario-input w-full"
        {...register("ruc", { 
          required: true,
           pattern: {
            value: /^\d{5,8}-\d{1}$/,
            message: "El RUC debe seguir un patrón similar a 123456-7",
          },
        
        })}
      />
      {errors.ruc && <CampoRequerido />}
      {errors.ruc && (
              <CampoRequerido mensaje={errors.ruc.message} />
            )}
    </div>

    <div>
      <label className="block text-sm font-medium text-black">Teléfono</label>
      <input
        type="text"
        placeholder="Ingrese un teléfono de contacto del proveedor..."
        className="formulario-input w-full"
        {...register("telefono", { required: true })}
      />
      {errors.telefono && <CampoRequerido />}
    </div>

    <div>
      <label className="block text-sm font-medium text-black">Observaciones</label>
      <input
        type="text"
        placeholder="Ingrese alguna observación..."
        className="formulario-input w-full"
        {...register("observaciones")}
      />
    </div>

    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        {...register("estado")}
        id="estado"
      />
      <label htmlFor="estado" className="text-sm text-black">Activo</label>
    </div>
  </fieldset>

          <div className="mt-6 flex flex-col sm:flex-row sm:justify-center gap-3">
            {puedeEscribir && !editable && (
              <button
                onClick={habilitarEdicion}
                type="button"
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded shadow"
              >
                Editar
              </button>
            )}
            {puedeEscribir && editable && (
              <button
                type="submit"
                form="editar-proveedor"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow"
              >
              💾 Guardar
              </button>
            )}
            {params.id && puedeEscribir && editable && (
              <button
                onClick={descartarProveedor}
                type="button"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow"
              >
                Eliminar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
