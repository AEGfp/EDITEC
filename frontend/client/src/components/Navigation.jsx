import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export function Navigation() {
  const navigate = useNavigate();
  const [showPermisosMenu, setShowPermisosMenu] = useState(false);
  const [showInfantesMenu, setShowInfantesMenu] = useState(false);
  const permisosRef = useRef(null);
  const infantesRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        permisosRef.current && !permisosRef.current.contains(event.target)
      ) {
        setShowPermisosMenu(false);
      }
      if (
        infantesRef.current && !infantesRef.current.contains(event.target)
      ) {
        setShowInfantesMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1E293B",
        padding: "1rem 2rem",
        color: "#F8FAFC",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        zIndex: 10,
      }}
    >
      <Link
        to="/"
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          color: "#38BDF8",
          textDecoration: "none",
        }}
      >
        EDITEC
      </Link>

      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        {/* Permisos Dropdown */}
        <div ref={permisosRef} style={{ position: "relative" }}>
          <span
            onClick={() => setShowPermisosMenu(!showPermisosMenu)}
            style={{
              cursor: "pointer",
              color: "#F8FAFC",
              fontSize: "1rem",
              padding: "0.5rem",
              userSelect: "none",
            }}
          >
            Permisos ▾
          </span>

          {showPermisosMenu && (
            <div
              style={{
                position: "absolute",
                top: "2.5rem",
                left: 0,
                backgroundColor: "#334155",
                padding: "0.5rem 0",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                zIndex: 20,
                minWidth: "160px",
              }}
            >
              <Link to="/permisos" style={menuLinkStyle}>Ver Permisos</Link>
              <Link to="/permisos-crear" style={menuLinkStyle}>Crear Permiso</Link>
            </div>
          )}
        </div>

        {/* Infantes Dropdown */}
        <div ref={infantesRef} style={{ position: "relative" }}>
          <span
            onClick={() => setShowInfantesMenu(!showInfantesMenu)}
            style={{
              cursor: "pointer",
              color: "#F8FAFC",
              fontSize: "1rem",
              padding: "0.5rem",
              userSelect: "none",
            }}
          >
            Infantes ▾
          </span>

          {showInfantesMenu && (
            <div
              style={{
                position: "absolute",
                top: "2.5rem",
                left: 0,
                backgroundColor: "#334155",
                padding: "0.5rem 0",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                zIndex: 20,
                minWidth: "160px",
              }}
            >
              <Link to="/infantes" style={menuLinkStyle}>Ver Infantes</Link>
              <Link to="/infantes-crear" style={menuLinkStyle}>Crear Infante</Link>
            </div>
          )}
        </div>

        {/* Botón logout */}
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#EF4444",
            border: "none",
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Sesión cerrada
        </button>
      </div>
    </nav>
  );
}

const menuLinkStyle = {
  display: "block",
  padding: "0.5rem 1rem",
  color: "#F8FAFC",
  textDecoration: "none",
  whiteSpace: "nowrap",
};
