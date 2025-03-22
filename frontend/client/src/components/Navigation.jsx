import { Link } from "react-router-dom";

export function Navigation() {
  return (
    <div>
      <Link to="/">
        <h1>EDITEC</h1>
      </Link>
      <Link to="/permisos">Permisos</Link>
      <h1> </h1>
      <Link to="/permisos-crear">Crear permiso</Link>
    </div>
  );
}
