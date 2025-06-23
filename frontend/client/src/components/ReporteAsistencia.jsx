import { crearReporteAsistencia } from "../api/asistencias.api";

export default function ReporteAsistencia({ infante, fechaDesde, fechaHasta }) {
  async function generarReporte() {
    try {
      const params = {};
      if (infante) {
        params.id_infante = infante;
      }
      if (fechaDesde) {
        params.fecha_desde = fechaDesde;
      }
      if (fechaHasta) {
        params.fecha_hasta = fechaHasta;
      }
      const res = await crearReporteAsistencia(params);
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
        Reporte asistencia
      </button>
    </div>
  );
}
