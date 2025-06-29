export const estiloTablas = {
  table: {
    style: {
      width: "100%",
      backgroundColor: "#f8fafc",
      borderRadius: "0.75rem",
      fontSize: "0.875rem",
      overflow: "hidden",
      border: "none",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#dbeafe", // bg-blue-100
      color: "#1e3a8a",           // text-blue-800
      fontWeight: "bold",
      fontSize: "0.95rem",
      borderTopLeftRadius: "0.75rem",
      borderTopRightRadius: "0.75rem",
      height: "3rem",
      borderBottom: "2px solid #3b82f6", // ⬅️ Este es el borde azul fuerte (bg-blue-500)
    },
  },
  
  headCells: {
    style: {
      padding: "0.75rem 1rem",
      fontWeight: "600",
    },
  },
  rows: {
    style: {
      backgroundColor: "#ffffff",
      fontSize: "0.875rem",
      borderBottom: "1px solid #e5e7eb",
      transition: "background-color 0.2s ease",
    },
    highlightOnHoverStyle: {
      backgroundColor: "#f3f4f6",
    },
  },
  cells: {
    style: {
      padding: "0.75rem 1rem",
    },
  },
  pagination: {
    style: {
      backgroundColor: "#f1f5f9",
      borderTop: "1px solid #e5e7eb",
      padding: "0.5rem 1rem",
      fontSize: "0.75rem",
    },
  },
};
