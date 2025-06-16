import {
  obtenerInscripciones,
  crearReporteInscripcion,
} from "../api/inscripciones.api";

export default function ReporteInscripcionesPage() {
  async function generarReporte() {
    try {
      const res = await crearReporteInscripcion({ responseType: "blob" });
      console.log(res.data);

      const archivo = new Blob([res.data], { type: "application/pdf" });
      const direccionArchivo = URL.createObjectURL(archivo);

      window.open(direccionArchivo);
    } catch (err) {
      console.log("Error intentar generar el repote:", err);
      alert("No se pudo generar el reporte");
    }
  }
  return (
    <div>
      <button className="boton-detalles" onClick={generarReporte}>
        Generar Reporte
      </button>
    </div>
  );
}
