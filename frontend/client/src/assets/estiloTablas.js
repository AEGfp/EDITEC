export const estiloTablas = {
  table: {
    style: {
      width: "100%",
      backgroundColor: "#f8fafc", // bg-slate-50
      border: "1px solid #d1d5db", // border-gray-300
      borderRadius: "0.375rem", // rounded
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", // shadow-md
      overflow: "hidden",
      fontSize: "0.875rem", // text-sm
    },
  },
  head: {
    style: {
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      fontSize: "1rem", // más pequeño que text-2xl
      fontWeight: "600",
      textAlign: "center",
      height: "2.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      fontWeight: "600",
      fontSize: "0.875rem",
    },
  },
  headCells: {
    style: {
      padding: "0.5rem 0.75rem",
    },
  },
  rows: {
    style: {
      backgroundColor: "#ffffff",
      fontSize: "0.875rem",
      paddingTop: "0.25rem",
      paddingBottom: "0.25rem",
      borderBottom: "1px solid #e5e7eb",
      transition: "background-color 0.2s ease",
    },
    highlightOnHoverStyle: {
      backgroundColor: "#f3f4f6",
      cursor: "pointer",
    },
  },
  cells: {
    style: {
      padding: "0.5rem 0.75rem",
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
