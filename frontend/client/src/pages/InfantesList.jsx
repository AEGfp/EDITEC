import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { obtenerInfantes, eliminarInfante } from "../api/infantes.api";
import { obtenerPersonas } from "../api/personas.api"; // 👈 importa la API

function InfantesList() {
  const [infantes, setInfantes] = useState([]);
  const [personasMap, setPersonasMap] = useState({});

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resInfantes, resPersonas] = await Promise.all([
        obtenerInfantes(),
        obtenerPersonas(),
      ]);

      const personas = resPersonas.data;
      const map = {};
      personas.forEach((p) => {
        map[p.id] = `${p.nombre} ${p.apellido}`;
      });
      setPersonasMap(map);
      setInfantes(resInfantes.data);
    } catch (error) {
      console.error("Error al obtener datos", error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro que deseas eliminar este infante?")) {
      await eliminarInfante(id);
      cargarDatos();
    }
  };

  const columns = [
    {
      name: "Nombre",
      selector: (row) => personasMap[row.id_persona] || "Desconocido",
      sortable: true,
      wrap : true
    },
    {
      name: "Alergia",
      selector: (row) => row.ind_alergia,
    },
    {
      name: "Lactosa",
      selector: (row) => row.ind_intolerancia_lactosa,
    },
    {
      name: "Celiaquismo",
      selector: (row) => row.ind_celiaquismo,
    },
    {
      name: "Cambio Pañal",
      selector: (row) => row.permiso_cambio_panhal,
    },
    {
      name: "Permiso Fotos",
      selector: (row) => row.permiso_fotos,
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
      <h2>🧒 Lista de Infantes</h2>
      <DataTable
        columns={columns}
        data={infantes}
        pagination
        responsive
        highlightOnHover
        striped
      />
    </div>
  );
}

export default InfantesList;
