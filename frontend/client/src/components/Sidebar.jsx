import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import tienePermiso from "../utils/tienePermiso";
import rutasProtegidas from "../config/rutasProtegidas";

export default function Sidebar({ abierto }) {
  const navigate = useNavigate();
  //const [abierto, setAbierto] = useState(true);
  const [subMenuAbierto, setSubMenuAbierto] = useState(false);
  const posicion = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    navigate("/login");
  };

  const activarSidebar = () => {
    setAbierto(!abierto);
  };

  //TODO agregar submenu
  const activarSubMenu = () => {
    setSubMenuAbierto(!subMenuAbierto);
  };

  const elementosVisibles = rutasProtegidas
    .filter((ruta) => ruta.nombre)
    .filter((elem) => {
      if (elem.publico) return true;
      return tienePermiso(elem.entidad, elem.permiso);
    });

  return (
    <>
      {/* <button
        onClick={activarSidebar}
        className="fixed top-4 left-4 z-50 bg-gray-800 text-white px-4 py-2 rounded"
      >
        {" "}
        ☰
      </button>*/}
      <aside
          className={`h-full bg-white border-r shadow-md border-gray-200 transition-all duration-300 ease-in-out ${
          abierto ? "w-56" : "w-0"
          } overflow-hidden`}
      >
      <nav
          className={`h-full flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 transition-opacity duration-100 relative ${
          abierto ? "opacity-100 delay-150" : "opacity-0"
          }`}
      >
          <div className="p-4 flex justify-end">
            {/*  <button
              onClick={activarSidebar}
              className="text-2xl font-bold text-black"
            >
              ✕
            </button>*/}
          </div>
          <ul className="flex-1 px-3 space-y-2">
            {elementosVisibles.map((elem) => (
              <li key={elem.path}>
                <Link
                  to={elem.path}
                  className={`block px-4 py-2 rounded transition-colors font-semibold ${
                    posicion.pathname === elem.path
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {elem.nombre}
                </Link>

                {elem.subrutas && (
                  <ul className="pl-6 pt-1">
                    {elem.subrutas
                      .filter((ruta) =>
                        ruta.publico
                          ? true
                          : tienePermiso(ruta.entidad, ruta.permiso)
                      )
                      .map((sub) => (
                        <li key={sub.path}>
                          <Link
                            to={sub.path}
                            className={`block px-3 py-2 rounded transition-colors ${
                              posicion.pathname === sub.path
                                ? "bg-blue-200 text-blue-800 font-semibold"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {sub.nombre}
                          </Link>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <div className="border-t p-3 hover:font-semibold hover:bg-red-600 hover:text-white border-gray-200">
            <button onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </nav>
      </aside>
    </>
  );
}
