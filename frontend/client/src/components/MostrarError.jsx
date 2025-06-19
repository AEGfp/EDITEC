export default function MostrarError({ errores }) {
  const extraerMensajes = (data, campo = null) => {
    if (typeof data === "string") {
      return campo ? [`${campo}: ${data}`] : [data];
    }
    if (Array.isArray(data)) {
      return data.flatMap((item) => extraerMensajes(item, campo));
    }
    if (typeof data === "object" && data !== null) {
      // Recorremos las claves con sus valores, incluyendo el nombre del campo
      return Object.entries(data).flatMap(([key, value]) =>
        extraerMensajes(value, key)
      );
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
