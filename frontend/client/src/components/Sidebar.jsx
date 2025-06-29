import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import tienePermiso from "../utils/tienePermiso";
import rutasProtegidas from "../config/rutasProtegidas";
import { FaChild, FaUsers, FaClipboardList, FaCalendarAlt, FaBook, FaUserPlus, FaSignOutAlt } from "react-icons/fa";

export default function Sidebar({ abierto }) {
  const navigate = useNavigate();
  const [subMenuAbierto, setSubMenuAbierto] = useState(false);
  const posicion = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  const activarSubMenu = () => {
    setSubMenuAbierto(!subMenuAbierto);
  };

  // Mapeo de iconos para las rutas principales
  const iconosPrincipales = {
    "Asistencias": <FaClipboardList className="w-5 h-5" />,
    "Historial": <FaBook className="w-5 h-5" />,
    "Infantes": <FaChild className="w-5 h-5" />,
    "Tutores": <FaUsers className="w-5 h-5" />,
    "Inscripciones": <FaUserPlus className="w-5 h-5" />,
    "Periodos": <FaCalendarAlt className="w-5 h-5" />,
    "Salas": <FaChild className="w-5 h-5" />,
    "Funcionarios": <FaUsers className="w-5 h-5" />
  };

  const elementosVisibles = rutasProtegidas
    .filter((ruta) => ruta.nombre)
    .filter((elem) => {
      if (elem.publico) return true;
      return tienePermiso(elem.entidad, elem.permiso);
    });

  return (
    <aside
      className={`h-full bg-gradient-to-b from-amber-50 to-amber-100 shadow-lg transition-all duration-300 ${
        abierto ? "w-64" : "w-0"
      } overflow-hidden border-r border-amber-200`}
    >
      <nav
        className={`h-full flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-amber-100 transition-opacity duration-100 ${
          abierto ? "opacity-100 delay-150" : "opacity-0"
        }`}
      >
        {/* Logo */}
        <div className="p-5 flex items-center justify-center border-b border-amber-200 bg-amber-50">
          <div className="text-xl font-bold text-amber-800 flex items-center gap-2">
            <FaChild className="w-6 h-6 text-amber-600" />
            <span className="tracking-wide"> EDITEC</span>
          </div>
        </div>

        {/* Menú */}
        <ul className="flex-1 px-3 py-3 space-y-1 text-sm">
          {elementosVisibles.map((elem) => (
            <li key={elem.path}>
              <Link
                to={elem.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-all font-medium ${
                  posicion.pathname === elem.path
                    ? "bg-amber-200 text-amber-800 shadow-inner border-l-4 border-amber-500"
                    : "text-amber-700 hover:bg-amber-200 hover:text-amber-800"
                }`}
              >
                <span className="w-6 mr-3 flex justify-center text-amber-600">
                  {iconosPrincipales[elem.nombre] || <FaChild className="w-5 h-5" />}
                </span>
                {elem.nombre}
              </Link>

              {elem.subrutas && (
                <ul className="pl-11 mt-1 space-y-1">
                  {elem.subrutas
                    .filter((ruta) =>
                      ruta.publico ? true : tienePermiso(ruta.entidad, ruta.permiso)
                    )
                    .map((sub) => (
                      <li key={sub.path}>
                        <Link
                          to={sub.path}
                          className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                            posicion.pathname === sub.path
                              ? "bg-amber-100 text-amber-700 font-medium"
                              : "text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                          }`}
                        >
                          <span className="w-5 mr-2 flex justify-center text-amber-500">
                            {sub.icono || (
                              <FaChild className="w-4 h-4" />
                            )}
                          </span>
                          {sub.nombre}
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {/* Botón cerrar sesión */}
        <div className="p-4 border-t border-amber-200 bg-amber-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition font-medium"
          >
            <FaSignOutAlt className="w-5 h-5 mr-2" />
            Cerrar sesión
          </button>
        </div>
      </nav>
    </aside>
  );
}