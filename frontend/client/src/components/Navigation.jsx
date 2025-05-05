import { useNavigate } from "react-router-dom";

export function Navigation({ activarSidebar, usuario }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-950 shadow-md font-semibold px-4 text-white py-2 flex items-center justify-between">
      <button onClick={activarSidebar} className="text-2xl cursor-pointer">
        ☰
      </button>

      <h1 className="text-lg  text-center flex-1 items-start">EDITEC</h1>
      <div className="flex items-center gap-4">
        <span>{usuario?.username}</span>
        <button onClick={handleLogout} className="boton-eliminar">
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
