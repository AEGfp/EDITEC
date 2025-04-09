import React, { useState } from "react";
import { crearTurno } from "../api/turnos.api";
import { useNavigate } from "react-router-dom";
function TurnosForm() {
  const [form, setForm] = useState({
    descripcion: "",
    id_usuario_aud: 1,
  });

  const navigate = useNavigate();
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearTurno(form);
      alert("Turno creado con éxito");
      navigate("/turnos");
    } catch (error) {
      console.error("Error al crear turno", error);
    }
  };

  const style = {
    container: {
      maxWidth: "500px",
      margin: "2rem auto",
      padding: "2rem",
      background: "#f8fafc",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      fontFamily: "Arial, sans-serif",
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      fontWeight: "bold",
      color: "#1e293b",
    },
    input: {
      width: "100%",
      padding: "0.6rem",
      marginBottom: "1.2rem",
      borderRadius: "6px",
      border: "1px solid #cbd5e1",
      fontSize: "1rem",
    },
    button: {
      backgroundColor: "#2563eb",
      color: "#fff",
      padding: "0.75rem 1.5rem",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "1rem",
      width: "100%",
      marginTop: "1rem",
    },
  };

  return (
    <div style={style.container}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Crear Turno</h2>
      <form onSubmit={handleSubmit}>
        <label style={style.label}>Descripción</label>
        <input
          type="text"
          name="descripcion"
          placeholder="Ej: Mañana, Tarde"
          onChange={handleChange}
          value={form.descripcion}
          style={style.input}
          required
        />

        <label style={style.label}>ID Usuario Auditor</label>
        <input
          type="number"
          name="id_usuario_aud"
          placeholder="ID Usuario Auditor"
          onChange={handleChange}
          value={form.id_usuario_aud}
          style={style.input}
        />

        <button type="submit" style={style.button}>Crear Turno</button>
      </form>
    </div>
  );
}

export default TurnosForm;
