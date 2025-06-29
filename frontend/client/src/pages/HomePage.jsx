import { useNavigate } from "react-router-dom";
import rutasProtegidas from "../config/rutasProtegidas";
import tienePermiso from "../utils/tienePermiso";

export default function HomePage() {
  const navigate = useNavigate();

  // Iconos personalizados para cada módulo
  const iconosModulos = {
    "Inscripciones": "📋",
    "Períodos": "🗓️",
    "Salas": "🏫", 
    "Funcionarios": "👩‍🏫",
    "Empresas": "🏢",
    "Sucursales": "🏬",
    "Transferencias": "📂",
    "Asistencias": "✅",
    "Historial": "📊",
    "Infantes": "👶",
    "Tutores": "👨‍👩‍👧‍👦",
    "Informes": "📑",
    "Notificaciones": "🔔"
  };

  // Filtra y agrupa rutas
  const rutasVisibles = rutasProtegidas
    .filter((ruta) => ruta.nombre)
    .filter((elem) => elem.publico || tienePermiso(elem.entidad, elem.permiso));

  const grupos = rutasVisibles.reduce((acc, ruta) => {
    const grupo = ruta.grupo || "Otros";
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(ruta);
    return acc;
  }, {});

  // Orden de los grupos
  const ordenGrupos = ["Director", "Profesor", "Administrador"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-amber-800 mb-3">Panel de Bienvenida</h1>
          <div className="flex justify-center">
            <div className="bg-amber-500 text-white px-6 py-1 rounded-full shadow-md">
              <p className="font-medium">EDITEC</p>
            </div>
          </div>
        </header>

        {/* Secciones por rol */}
        {ordenGrupos.filter(g => grupos[g]).map((grupo) => (
          <section key={grupo} className="mb-14">
            {/* Título del grupo */}
            <div className={`p-4 mb-6 rounded-lg shadow-sm border-l-8 ${
              grupo === "Director"
                ? "bg-amber-100 border-amber-400"
                : grupo === "Profesor"
                ? "bg-blue-100 border-blue-400"
                : "bg-green-100 border-green-400"
            }`}>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-3 text-3xl">
                  {grupo === "Director" ? "👨‍🏫" : grupo === "Profesor" ? "👩‍🏫" : "💼"}
                </span>
                {grupo}
              </h2>
            </div>

            {/* Tarjetas de módulos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {grupos[grupo].map((modulo) => (
                <div
                  key={modulo.path}
                  onClick={() => navigate(modulo.path)}
                  className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-amber-300 group"
                >
                  <div className="flex flex-col h-full">
                    {/* Icono */}
                    <div className="text-4xl mb-4 text-amber-500">
                      {iconosModulos[modulo.nombre] || "📁"}
                    </div>
                    
                    {/* Nombre del módulo */}
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-amber-600">
                      {modulo.nombre}
                    </h3>
                    
                    {/* Botón */}
                    <div className="mt-auto">
                      <button
                        className={`w-full py-2 px-4 text-white font-medium rounded-lg transition-colors shadow-sm ${
                          grupo === "Director"
                            ? "bg-amber-500 hover:bg-amber-600"
                            : grupo === "Profesor"
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(modulo.path);
                        }}
                      >
                        Ingresar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
