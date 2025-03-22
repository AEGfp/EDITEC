import { useNavigate } from "react-router-dom";

export default function Elemento({ elemento }) {
  const navigate = useNavigate();

  return (
    <div
      style={{ background: "#909090" }}
      onClick={() => {
        navigate(`/permisos/${elemento.id}`);
      }}
    >
      <h2>{elemento.descripcion}</h2>
    </div>
  );
}
