import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { obtenerSalas, eliminarSala } from "../api/salas.api";

function SalasList() {
  const [salas, setSalas] = useState([]);

  useEffect(() => {
    cargarSalas();
  }, []);

  const cargarSalas = async () => {
    try {
      const res = await obtenerSalas();
      setSalas(res.data);
    } catch (error) {
      console.error("Error al obtener salas", error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro que deseas eliminar esta sala?")) {
      await eliminarSala(id);
      cargarSalas();
    }
  };

  const columns = [
    {
      name: "Descripción",
      selector: (row) => row.descripcion,
      sortable: true,
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
      <h2>🏫 Lista de Salas</h2>
      <DataTable
        columns={columns}
        data={salas}
        pagination
        responsive
        highlightOnHover
        striped
      />
    </div>
  );
}

export default SalasList;
