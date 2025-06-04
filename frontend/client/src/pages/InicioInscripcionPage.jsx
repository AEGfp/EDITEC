import { useNavigate } from "react-router-dom";

export default function InicioInscripcionPage() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center">
      <div className="formulario-dentro">
        <h1 className="formulario-titulo">¿Tenés una cuenta en el sistema?</h1>
        <div className="botones-grupo">
          <button
            className="boton-detalles"
            onClick={() =>
              navigate("/login", { state: { desdeInscripcion: true } })
            }
          >
            Sí
          </button>
          <button
            className="boton-guardar"
            onClick={() => navigate("/realizar-inscripcion")}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
