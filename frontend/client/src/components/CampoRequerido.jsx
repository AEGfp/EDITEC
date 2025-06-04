import React from "react";

export default function CampoRequerido({ mensaje }) {
  return <span className="mensaje-error">{mensaje || "Campo requerido!"}</span>;
}
