import {
  obtenerInscripciones,
  crearReporteInscripcion,
} from "../api/inscripciones.api";

export default function ReporteInscripcionesPage({ estado }) {
  async function generarReporte() {
    try {
      const params = {};
      if (estado) {
        params.estado_filtro = estado;
      }
      const res = await crearReporteInscripcion(params);
      console.log(res.data);

      const archivo = new Blob([res.data], { type: "application/pdf" });
      const direccionArchivo = URL.createObjectURL(archivo);

      window.open(direccionArchivo);
    } catch (err) {
      console.log("Error intentar generar el repote:", err);
      alert("No se pudo generar el reporte");
    }
  }

  const botonClassName =
    estado === "rechazada" ? "boton-eliminar" : "boton-detalles";
  const textoBoton = `Reporte inscripciones${estado ? ` ${estado}s` : ""}`;

  return (
    <div>
      <button className={botonClassName} onClick={generarReporte}>
        {textoBoton}
      </button>
    </div>
  );
}
