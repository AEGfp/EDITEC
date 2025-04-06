import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export function Navigation() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    navigate("/login");
  };

  return (
    <div>
      <Link to="/">
        <h1>EDITEC</h1>
      </Link>
      <Link to="/permisos">Permisos</Link>
      <h1> </h1>
      <Link to="/permisos-crear">Crear permiso</Link>
      <div>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </div>
    </div>
  );
}
