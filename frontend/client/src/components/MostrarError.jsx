export default function MostrarError({ errores }) {
  const extraerMensajes = (data, campo = null) => {
    if (typeof data === "string") {
      if (data.startsWith("<!DOCTYPE html>")) return ["Error del servidor"];
      return [data];
    }
    if (Array.isArray(data)) {
      return data.flatMap((item) => extraerMensajes(item, campo));
    }
    if (typeof data === "object" && data !== null) {
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
