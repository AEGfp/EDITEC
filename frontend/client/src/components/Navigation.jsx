import { useNavigate } from "react-router-dom";

export function Navigation({ activarSidebar, usuario }) {
  const navigate = useNavigate();

  return (
    <nav className="bg-amber-100 border-b border-amber-200 shadow-sm font-medium px-4 py-2 flex items-center justify-between">
      {/* Botón Hamburguesa */}
      <div className="flex items-center gap-2">
        <button
          onClick={activarSidebar}
          className="text-2xl cursor-pointer px-2 text-amber-700 hover:text-amber-900 transition"
        >
          ☰
        </button>
      </div>

      {/* Usuario */}
      <div className="flex items-center gap-3">
        <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow">
          {usuario?.username?.charAt(0).toUpperCase() || "U"}
        </div>
        <span className="text-amber-800 hidden sm:inline">
          Hola, <strong>{usuario?.username}</strong>
        </span>
      </div>
    </nav>
  );
}
