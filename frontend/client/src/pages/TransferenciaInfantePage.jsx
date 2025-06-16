import { useEffect, useState } from "react";
import { obtenerInfantes } from "../api/infantes.api";
import { obtenerSalas } from "../api/salas.api";
import { obtenerFuncionarios } from "../api/funcionarios.api";
import { transferirInfante, transferirProfesor } from "../api/transferencia.api";
import CampoRequerido from "../components/CampoRequerido";

function TransferenciaInfantePage() {
  const [salas, setSalas] = useState([]);
  const [infantes, setInfantes] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [formInfante, setFormInfante] = useState({
    id_infante: "",
    id_nueva_sala: "",
  });
  const [formProfesor, setFormProfesor] = useState({
    id_profesor: "",
    id_sala_destino: "",
  });
  const [erroresInfante, setErroresInfante] = useState({});
  const [erroresProfesor, setErroresProfesor] = useState({});
  const [mensajeInfante, setMensajeInfante] = useState("");
  const [mensajeProfesor, setMensajeProfesor] = useState("");

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
    setMensajeInfante("");
  };

  const handleChangeProfesor = (e) => {
    const { name, value } = e.target;
    setFormProfesor((prev) => ({ ...prev, [name]: value }));
    setErroresProfesor({});
    setMensajeProfesor("");
  };

  const handleSubmitInfante = async (e) => {
    e.preventDefault();
    if (!formInfante.id_infante || !formInfante.id_nueva_sala) {
      setErroresInfante({
        id_infante: !formInfante.id_infante,
        id_nueva_sala: !formInfante.id_nueva_sala,
      });
      return;
    }

    try {
      const res = await transferirInfante(formInfante);
      setMensajeInfante(res.data.mensaje || "Transferencia exitosa.");
    } catch (error) {
      console.error("Error al transferir infante:", error);
      setMensajeInfante("Ocurrió un error al transferir el infante.");
    }
  };

  const handleSubmitProfesor = async (e) => {
    e.preventDefault();
    if (!formProfesor.id_profesor || !formProfesor.id_sala_destino) {
      setErroresProfesor({
        id_profesor: !formProfesor.id_profesor,
        id_sala_destino: !formProfesor.id_sala_destino,
      });
      return;
    }

    try {
      const res = await transferirProfesor(formProfesor);
      setMensajeProfesor(res.data.mensaje || "Transferencia de profesor exitosa.");
    } catch (error) {
      console.error("Error al transferir profesor:", error);
      setMensajeProfesor("Ocurrió un error al transferir el profesor.");
    }
  };

  return (
    <div className="formulario">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">Transferencia de Sala</h1>

        {/* Transferencia de Infante */}
        <form onSubmit={handleSubmitInfante}>
          <h4 className="formulario-elemento">Infante</h4>
          <select
            className="formulario-input"
            name="id_infante"
            value={formInfante.id_infante}
            onChange={handleChangeInfante}
          >
            <option value="">Seleccione el infante</option>
            {infantes.map((inf) => (
              <option key={inf.id} value={inf.id}>
                {inf.id_persona?.nombre} {inf.id_persona?.apellido}
              </option>
            ))}
          </select>
          {erroresInfante.id_infante && <CampoRequerido />}

          <h4 className="formulario-elemento">Nueva Sala del Infante</h4>
          <select
            className="formulario-input"
            name="id_nueva_sala"
            value={formInfante.id_nueva_sala}
            onChange={handleChangeInfante}
          >
            <option value="">Seleccione la sala</option>
            {salas.map((sala) => (
              <option key={sala.id} value={sala.id}>
                {sala.descripcion} {sala.nombre_profesor ? `(${sala.nombre_profesor})` : ""}
              </option>
            ))}
          </select>
          {erroresInfante.id_nueva_sala && <CampoRequerido />}

          <div className="flex justify-center mt-4">
            <button type="submit" className="boton-guardar">Transferir Infante</button>
          </div>
          {mensajeInfante && <p className="text-green-600 mt-2 text-center">{mensajeInfante}</p>}
        </form>

        <hr className="my-6 border-t" />

        {/* Transferencia de Profesor */}
        <form onSubmit={handleSubmitProfesor}>
          <h4 className="formulario-elemento">Profesor</h4>
          <select
            className="formulario-input"
            name="id_profesor"
            value={formProfesor.id_profesor}
            onChange={handleChangeProfesor}
          >
            <option value="">Seleccione el profesor</option>
            {profesores.map((prof) => (
                <option key={prof.persona?.id} value={prof.persona?.id}>
                {prof.persona?.nombre} {prof.persona?.apellido}
              </option>
            ))}
          </select>
          {erroresProfesor.id_profesor && <CampoRequerido />}

          <h4 className="formulario-elemento">Nueva Sala del Profesor</h4>
          <select
            className="formulario-input"
            name="id_sala_destino"
            value={formProfesor.id_sala_destino}
            onChange={handleChangeProfesor}
          >
            <option value="">Seleccione la sala</option>
            {salas.map((sala) => (
              <option key={sala.id} value={sala.id}>
                {sala.descripcion}
              </option>
            ))}
          </select>
          {erroresProfesor.id_sala_destino && <CampoRequerido />}

          <div className="flex justify-center mt-4">
            <button type="submit" className="boton-guardar">Transferir Profesor</button>
          </div>
          {mensajeProfesor && <p className="text-green-600 mt-2 text-center">{mensajeProfesor}</p>}
        </form>
      </div>
    </div>
  );
}

export default TransferenciaInfantePage;
