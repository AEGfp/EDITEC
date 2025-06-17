export default function MostrarError({ errores }) {
  const extraerMensajes = (data) => {
    if (typeof data === "string") return [data];
    if (Array.isArray(data)) {
      return data.flatMap(extraerMensajes);
    }
    if (typeof data === "object" && data !== null) {
      return Object.values(data).flatMap(extraerMensajes);
    }
    return ["Error desconocido"];
  };

  if (!errores) return null;

  const mensajes = extraerMensajes(errores);

  return (
    <div className="mensaje-error" style={{ whiteSpace: "pre-line" }}>
      {mensajes.join("\n")}
    </div>
  );
}
