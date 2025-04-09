import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { obtenerTurnos, eliminarTurno } from "../api/turnos.api";

function TurnosList() {
  const [turnos, setTurnos] = useState([]);

  useEffect(() => {
    cargarTurnos();
  }, []);

  const cargarTurnos = async () => {
    try {
      const res = await obtenerTurnos();
      setTurnos(res.data);
    } catch (error) {
      console.error("Error al obtener turnos", error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro que deseas eliminar este turno?")) {
      await eliminarTurno(id);
      cargarTurnos();
    }
  };

  const columns = [
    { name: "Descripción", selector: (row) => row.descripcion, sortable: true },
    { name: "Usuario Auditor", selector: (row) => row.id_usuario_aud },
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
      <h2>⏰ Lista de Turnos</h2>
      <DataTable
        columns={columns}
        data={turnos}
        pagination
        highlightOnHover
        striped
        responsive
      />
    </div>
  );
}

export default TurnosList;
