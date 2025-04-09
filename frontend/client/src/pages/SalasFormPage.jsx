import React, { useState } from "react";
import { crearSala } from "../api/salas.api";
import { useNavigate } from "react-router-dom";
function SalasForm() {
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
      await crearSala(form);
      alert("Sala creada con éxito");
      //hacemos que nos redireccione a la lista de salas
      navigate("/salas");
    } catch (error) {
      console.error("Error al crear sala", error);
    }
  };

  const containerStyle = {
    maxWidth: "600px",
    margin: "2rem auto",
    padding: "2rem",
    background: "#f8fafc",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "bold",
    color: "#1e293b",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.6rem",
    marginBottom: "1.2rem",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "1rem",
  };

  const buttonStyle = {
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
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
        Crear Sala
      </h2>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Descripción</label>
        <input
          type="text"
          name="descripcion"
          placeholder="Nombre de la sala"
          onChange={handleChange}
          value={form.descripcion}
          style={inputStyle}
          required
        />

        <label style={labelStyle}>ID Usuario Auditor</label>
        <input
          type="number"
          name="id_usuario_aud"
          onChange={handleChange}
          value={form.id_usuario_aud}
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>Crear Sala</button>
      </form>
    </div>
  );
}

export default SalasForm;
