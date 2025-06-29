import { useEffect, useState } from "react";
import { obtenerInfantes } from "../api/infantes.api";
import { obtenerSalas } from "../api/salas.api";
import { obtenerFuncionarios } from "../api/funcionarios.api";
import {
  transferirInfante,
  transferirProfesor,
  crearReporteTransferencias,
} from "../api/transferencia.api";
import CampoRequerido from "../components/CampoRequerido";

function TransferenciaInfantePage() {
  const [salas, setSalas] = useState([]);
  const [infantes, setInfantes] = useState([]);
  const [profesores, setProfesores] = useState([]);

  const [formInfante, setFormInfante] = useState({
    id_infante: "",
    id_nueva_sala: "",
    motivo: "",
  });
  const [formProfesor, setFormProfesor] = useState({
    id_profesor: "",
    id_sala_destino: "",
    motivo: "",
  });

  const [erroresInfante, setErroresInfante] = useState({});
  const [erroresProfesor, setErroresProfesor] = useState({});
  const [mensajeInfante, setMensajeInfante] = useState(null);
  const [mensajeProfesor, setMensajeProfesor] = useState(null);

  const [cargandoInfante, setCargandoInfante] = useState(false);
  const [cargandoProfesor, setCargandoProfesor] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const resSalas = await obtenerSalas();
        const resInfantes = await obtenerInfantes();
        const resProfesores = await obtenerFuncionarios({ grupo: "profesor" });

        setSalas(resSalas.data);
        setInfantes(resInfantes.data);
        setProfesores(resProfesores.data);
      } catch (e) {
        console.error("Error cargando datos:", e);
      }
    }
    cargarDatos();
  }, []);

  const handleChangeInfante = (e) => {
    setFormInfante((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErroresInfante({});
    setMensajeInfante(null);
  };

  const handleChangeProfesor = (e) => {
    setFormProfesor((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErroresProfesor({});
    setMensajeProfesor(null);
  };

  const handleSubmitInfante = async (e) => {
    e.preventDefault();
    if (cargandoInfante) return;

    const errores = {
      id_infante: !formInfante.id_infante,
      id_nueva_sala: !formInfante.id_nueva_sala,
      motivo: !formInfante.motivo.trim(),
    };

    if (Object.values(errores).some(Boolean)) {
      setErroresInfante(errores);
      return;
    }

    setMensajeInfante(null);
    setCargandoInfante(true);

    try {
      const res = await transferirInfante(formInfante);
      setMensajeInfante({
        tipo: "exito",
        texto: res.data.mensaje || "Transferencia exitosa.",
      });
      setFormInfante({ id_infante: "", id_nueva_sala: "", motivo: "" });
    } catch (error) {
      const mensaje =
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.detail ||
        Object.values(error.response?.data || {}).flat()[0] ||
        "Ocurrió un error al transferir el infante.";
      setMensajeInfante({ tipo: "error", texto: mensaje });
    } finally {
      setCargandoInfante(false);
    }
  };

  const handleSubmitProfesor = async (e) => {
    e.preventDefault();
    if (cargandoProfesor) return;

    const errores = {
      id_profesor: !formProfesor.id_profesor,
      id_sala_destino: !formProfesor.id_sala_destino,
      motivo: !formProfesor.motivo.trim(),
    };

    if (Object.values(errores).some(Boolean)) {
      setErroresProfesor(errores);
      return;
    }

    setMensajeProfesor(null);
    setCargandoProfesor(true);

    try {
      const res = await transferirProfesor(formProfesor);
      setMensajeProfesor({
        tipo: "exito",
        texto: res.data.mensaje || "Transferencia de profesor exitosa.",
      });
      setFormProfesor({ id_profesor: "", id_sala_destino: "", motivo: "" });
    } catch (error) {
      const mensaje =
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.detail ||
        Object.values(error.response?.data || {}).flat()[0] ||
        "Ocurrió un error al transferir el profesor.";
      setMensajeProfesor({ tipo: "error", texto: mensaje });
    } finally {
      setCargandoProfesor(false);
    }
  };

  const generarReporteTransferencias = async () => {
    try {
      const res = await crearReporteTransferencias();
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "reporte_transferencias.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al generar el reporte de transferencias:", error);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6">
      <h1 className="text-lg font-semibold text-blue-800 flex justify-center text-center mb-4 bg-blue-200 rounded-md px-4 py-2">
  🔄 Transferencia de Sala
</h1>


        {/* Formulario Infante */}
        <form onSubmit={handleSubmitInfante} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800">Infante:</label>
            <select
              name="id_infante"
              value={formInfante.id_infante}
              onChange={handleChangeInfante}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Seleccione el infante</option>
              {infantes.map((inf) => (
                <option key={inf.id} value={inf.id}>
                  {inf.id_persona?.nombre} {inf.id_persona?.apellido}
                </option>
              ))}
            </select>
            {erroresInfante.id_infante && <CampoRequerido />}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800">Nueva Sala:</label>
            <select
              name="id_nueva_sala"
              value={formInfante.id_nueva_sala}
              onChange={handleChangeInfante}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Seleccione la sala</option>
              {salas.map((sala) => (
                <option key={sala.id} value={sala.id}>
                  {sala.descripcion} {sala.nombre_profesor ? `(${sala.nombre_profesor})` : ""}
                </option>
              ))}
            </select>
            {erroresInfante.id_nueva_sala && <CampoRequerido />}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800">Motivo:</label>
            <textarea
              name="motivo"
              value={formInfante.motivo}
              onChange={handleChangeInfante}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Ingrese el motivo de la transferencia"
            />
            {erroresInfante.motivo && <CampoRequerido />}
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
            disabled={cargandoInfante}
          >
            {cargandoInfante ? "Transfiriendo..." : "Transferir Infante"}
          </button>

          {mensajeInfante && (
            <p className={`text-center ${mensajeInfante.tipo === "exito" ? "text-green-600" : "text-red-600"}`}>
              {mensajeInfante.texto}
            </p>
          )}
        </form>

        <hr className="my-6" />

        {/* Formulario Profesor */}
        <form onSubmit={handleSubmitProfesor} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800">Profesor:</label>
            <select
              name="id_profesor"
              value={formProfesor.id_profesor}
              onChange={handleChangeProfesor}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Seleccione el profesor</option>
              {profesores.map((prof) => (
                <option key={prof.persona?.id} value={prof.persona?.id}>
                  {prof.persona?.nombre} {prof.persona?.apellido}
                </option>
              ))}
            </select>
            {erroresProfesor.id_profesor && <CampoRequerido />}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800">Nueva Sala:</label>
            <select
              name="id_sala_destino"
              value={formProfesor.id_sala_destino}
              onChange={handleChangeProfesor}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Seleccione la sala</option>
              {salas.map((sala) => (
                <option key={sala.id} value={sala.id}>
                  {sala.descripcion}
                </option>
              ))}
            </select>
            {erroresProfesor.id_sala_destino && <CampoRequerido />}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800">Motivo:</label>
            <textarea
              name="motivo"
              value={formProfesor.motivo}
              onChange={handleChangeProfesor}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Ingrese el motivo de la transferencia"
            />
            {erroresProfesor.motivo && <CampoRequerido />}
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
            disabled={cargandoProfesor}
          >
            {cargandoProfesor ? "Transfiriendo..." : "Transferir Profesor"}
          </button>

          {mensajeProfesor && (
            <p className={`text-center ${mensajeProfesor.tipo === "exito" ? "text-green-600" : "text-red-600"}`}>
              {mensajeProfesor.texto}
            </p>
          )}
        </form>

        <div className="flex justify-center mt-6">
          <button
            onClick={generarReporteTransferencias}
            className="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition w-full"
          >
            📄 Generar Reporte de Transferencias
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransferenciaInfantePage;
