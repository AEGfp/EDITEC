import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { obtenerTutores, eliminarTutor } from "../api/tutores.api";
import { obtenerPersonas } from "../api/personas.api";

function TutoresList() {
  const [tutores, setTutores] = useState([]);
  const [personasMap, setPersonasMap] = useState({});

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resTutores, resPersonas] = await Promise.all([
        obtenerTutores(),
        obtenerPersonas(),
      ]);

      const map = {};
      resPersonas.data.forEach((p) => {
        map[p.id] = `${p.nombre} ${p.apellido}`;
      });

      setPersonasMap(map);
      setTutores(resTutores.data);
    } catch (error) {
      console.error("Error al cargar tutores o personas:", error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro que deseas eliminar este tutor?")) {
      await eliminarTutor(id);
      cargarDatos();
    }
  };

  const columns = [
    {
      name: "Nombre",
      selector: (row) => personasMap[row.id_persona] || "Desconocido",
      sortable: true,
      wrap: true,
    },
    {
      name: "Docente",
      selector: (row) => (row.es_docente ? "Sí" : "No"),
    },
    {
      name: "Estudiante",
      selector: (row) => (row.es_estudiante ? "Sí" : "No"),
    },
    {
      name: "Funcionario",
      selector: (row) => (row.es_funcionario ? "Sí" : "No"),
    },
    {
      name: "Tel. Casa",
      selector: (row) => row.telefono_casa,
    },
    {
      name: "Tel. Part.",
      selector: (row) => row.telefono_particular,
    },
    {
      name: "Tel. Trabajo",
      selector: (row) => row.telefono_trabajo,
    },
    {
      name: "Empresa",
      selector: (row) => row.nombre_empresa_trabajo,
      wrap: true,
    },
    {
      name: "Dirección",
      selector: (row) => row.direccion_trabajo,
      wrap: true,
    },
    {
      name: "Usuario Aud.",
      selector: (row) => row.id_usuario_aud,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <button
          onClick={() => handleDelete(row.id)}
          style={{
            backgroundColor: "#ef4444",
            color: "#fff",
            padding: "4px 8px",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Eliminar
        </button>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>👨‍🏫 Lista de Tutores</h2>
      <DataTable
        columns={columns}
        data={tutores}
        pagination
        responsive
        highlightOnHover
        striped
      />
    </div>
  );
}

export default TutoresList;
