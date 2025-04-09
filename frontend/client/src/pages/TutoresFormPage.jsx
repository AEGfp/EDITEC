import React, { useState, useEffect } from "react";
import { crearTutor } from "../api/tutores.api";
import { obtenerPersonas } from "../api/personas.api";
import { useNavigate} from "react-router-dom";
function TutoresForm() {
  const [form, setForm] = useState({
    es_docente: false,
    es_estudiante: false,
    es_funcionario: false,
    id_persona: "",
    telefono_casa: "",
    telefono_particular: "",
    telefono_trabajo: "",
    nombre_empresa_trabajo: "",
    direccion_trabajo: "",
    observaciones: "",
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

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearTutor(form);
      alert("Tutor creado con éxito");
      navigate("/tutores");
    } catch (error) {
      console.error("Error al crear tutor", error);
    }
  };

  const style = {
    container: {
      maxWidth: "600px",
      margin: "2rem auto",
      padding: "2rem",
      background: "#f8fafc",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
    label: {
      display: "block",
      marginBottom: "0.4rem",
      fontWeight: "bold",
    },
    input: {
      width: "100%",
      padding: "0.5rem",
      marginBottom: "1rem",
      border: "1px solid #ccc",
      borderRadius: "5px",
    },
    checkbox: {
      marginRight: "0.5rem",
    },
    button: {
      backgroundColor: "#2563eb",
      color: "white",
      padding: "0.7rem",
      border: "none",
      borderRadius: "8px",
      fontWeight: "bold",
      width: "100%",
      marginTop: "1rem",
    },
  };

  return (
    <div style={style.container}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Crear Tutor</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <input
            type="checkbox"
            name="es_docente"
            checked={form.es_docente}
            onChange={handleChange}
            style={style.checkbox}
          />
          Es docente
        </label>

        <label>
          <input
            type="checkbox"
            name="es_estudiante"
            checked={form.es_estudiante}
            onChange={handleChange}
            style={style.checkbox}
          />
          Es estudiante
        </label>

        <label>
          <input
            type="checkbox"
            name="es_funcionario"
            checked={form.es_funcionario}
            onChange={handleChange}
            style={style.checkbox}
          />
          Es funcionario
        </label>

        <label style={style.label}>Persona</label>
        <select
          name="id_persona"
          value={form.id_persona}
          onChange={handleChange}
          style={style.input}
        >
          <option value="">Seleccionar persona...</option>
          {personas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} {p.apellido}
            </option>
          ))}
        </select>

        <label style={style.label}>Teléfono casa</label>
        <input name="telefono_casa" value={form.telefono_casa} onChange={handleChange} style={style.input} />

        <label style={style.label}>Teléfono particular</label>
        <input name="telefono_particular" value={form.telefono_particular} onChange={handleChange} style={style.input} />

        <label style={style.label}>Teléfono trabajo</label>
        <input name="telefono_trabajo" value={form.telefono_trabajo} onChange={handleChange} style={style.input} />

        <label style={style.label}>Nombre empresa trabajo</label>
        <input name="nombre_empresa_trabajo" value={form.nombre_empresa_trabajo} onChange={handleChange} style={style.input} />

        <label style={style.label}>Dirección trabajo</label>
        <input name="direccion_trabajo" value={form.direccion_trabajo} onChange={handleChange} style={style.input} />

        <label style={style.label}>Observaciones</label>
        <textarea name="observaciones" value={form.observaciones} onChange={handleChange} style={style.input} />

        <label style={style.label}>ID Usuario Auditor</label>
        <input type="number" name="id_usuario_aud" value={form.id_usuario_aud} onChange={handleChange} style={style.input} />

        <button type="submit" style={style.button}>Crear Tutor</button>
      </form>
    </div>
  );
}

export default TutoresForm;
