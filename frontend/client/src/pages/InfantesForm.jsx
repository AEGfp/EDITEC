import React, { useState, useEffect } from "react";
import { crearInfante } from "../api/infantes.api";
import { obtenerPersonas } from "../api/personas.api.js"; // Asegurate de crear esto
import { useNavigate } from "react-router-dom";
function InfanteForm() {
  const [form, setForm] = useState({
    id_persona: "",
    ind_alergia: "N",
    ind_intolerancia_lactosa: "N",
    ind_celiaquismo: "N",
    permiso_cambio_panhal: "N",
    permiso_fotos: "N",
    id_usuario_aud: 1,
  });

  const [personas, setPersonas] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await obtenerPersonas();
        setPersonas(res.data);
      } catch (err) {
        console.error("Error al cargar personas", err);
      }
    };
    fetchPersonas();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearInfante(form);
      alert("Infante creado con éxito");
      navigate("/infantes");
    } catch (error) {
      console.error("Error al crear infante", error);
    }
  };

  // Estilos como los tenías antes
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
        Crear Infante
      </h2>
      <form onSubmit={handleSubmit}>
        {/* Selección por nombre de persona */}
        <label style={labelStyle}>Persona</label>
        <select
          name="id_persona"
          onChange={handleChange}
          value={form.id_persona}
          style={inputStyle}
          required
        >
          <option value="">Seleccionar persona...</option>
          {personas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} {p.apellido}
            </option>
          ))}
        </select>

        {/* Resto del formulario igual */}
        <label style={labelStyle}>¿Tiene alergia?</label>
        <select name="ind_alergia" onChange={handleChange} value={form.ind_alergia} style={inputStyle}>
          <option value="N">No</option>
          <option value="S">Sí</option>
        </select>

        <label style={labelStyle}>¿Intolerancia a la lactosa?</label>
        <select name="ind_intolerancia_lactosa" onChange={handleChange} value={form.ind_intolerancia_lactosa} style={inputStyle}>
          <option value="N">No</option>
          <option value="S">Sí</option>
        </select>

        <label style={labelStyle}>¿Celiaquismo?</label>
        <select name="ind_celiaquismo" onChange={handleChange} value={form.ind_celiaquismo} style={inputStyle}>
          <option value="N">No</option>
          <option value="S">Sí</option>
        </select>

        <label style={labelStyle}>¿Permiso para cambiar pañal?</label>
        <select name="permiso_cambio_panhal" onChange={handleChange} value={form.permiso_cambio_panhal} style={inputStyle}>
          <option value="N">No</option>
          <option value="S">Sí</option>
        </select>

        <label style={labelStyle}>¿Permiso para fotos?</label>
        <select name="permiso_fotos" onChange={handleChange} value={form.permiso_fotos} style={inputStyle}>
          <option value="N">No</option>
          <option value="S">Sí</option>
        </select>

        <label style={labelStyle}>ID Usuario Auditor</label>
        <input
          type="number"
          name="id_usuario_aud"
          placeholder="ID Usuario Auditor"
          onChange={handleChange}
          value={form.id_usuario_aud}
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>Crear Infante</button>
      </form>
    </div>
  );
}

export default InfanteForm;
