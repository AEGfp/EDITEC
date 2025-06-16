// src/pages/TransferenciaInfantePage.jsx
import { useEffect, useState } from "react";
import { obtenerInfantes } from "../api/infantes.api";
import { obtenerSalas } from "../api/salas.api";
import { transferirInfante } from "../api/transferencia.api";
import CampoRequerido from "../components/CampoRequerido";

function TransferenciaInfantePage() {
  const [salas, setSalas] = useState([]);
  const [infantes, setInfantes] = useState([]);
  const [formData, setFormData] = useState({
    id_infante: "",
    id_nueva_sala: "",
  });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarDatos() {
      try {
        const resSalas = await obtenerSalas();
        const resInfantes = await obtenerInfantes();
        setSalas(resSalas.data);
        setInfantes(resInfantes.data);
      } catch (e) {
        console.error("Error cargando datos:", e);
      }
    }
    cargarDatos();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrores({});
    setMensaje("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_infante || !formData.id_nueva_sala) {
      setErrores({
        id_infante: !formData.id_infante,
        id_nueva_sala: !formData.id_nueva_sala,
      });
      return;
    }

    try {
      const res = await transferirInfante(formData);
      setMensaje(res.data.mensaje || "Transferencia exitosa.");
    } catch (error) {
      console.error("❌ Error al transferir:", error.response?.data || error);
      setMensaje("Ocurrió un error al transferir el infante.");
    }
  };

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">Transferencia de Sala</h1>
        <form onSubmit={handleSubmit}>
          <h4 className="formulario-elemento">Infante</h4>
          <select
            className="formulario-input"
            name="id_infante"
            value={formData.id_infante}
            onChange={handleChange}
          >
            <option value="">Seleccione el infante</option>
            {infantes.map((inf) => (
              <option key={inf.id} value={inf.id}>
                {inf.id_persona?.nombre} {inf.id_persona?.apellido}
              </option>
            ))}
          </select>
          {errores.id_infante && <CampoRequerido />}

          <h4 className="formulario-elemento">Nueva Sala</h4>
          <select
            className="formulario-input"
            name="id_nueva_sala"
            value={formData.id_nueva_sala}
            onChange={handleChange}
          >
            <option value="">Seleccione la sala</option>
            {salas.map((sala) => (
              <option key={sala.id} value={sala.id}>
                {sala.descripcion} {sala.nombre_profesor ? `(${sala.nombre_profesor})` : ""}
              </option>
            ))}
          </select>
          {errores.id_nueva_sala && <CampoRequerido />}

          <div className="flex justify-center mt-4">
          <button type="submit" className="boton-guardar mt-2">
            Guardar
          </button>
        
          </div>
          {mensaje && <p className="text-green-600 mt-2">{mensaje}</p>}
        </form>
      </div>
    </div>
  );
}

export default TransferenciaInfantePage;
