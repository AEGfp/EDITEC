import { useNavigate } from "react-router-dom";
import rutasProtegidas from "../config/rutasProtegidas";
import tienePermiso from "../utils/tienePermiso";

export default function HomePage() {
  const navigate = useNavigate();

  const rutasVisibles = rutasProtegidas
    .filter((ruta) => ruta.nombre)
    .filter((elem) => elem.publico || tienePermiso(elem.entidad, elem.permiso));

  const grupos = rutasVisibles.reduce((acc, ruta) => {
    const grupo = ruta.grupo || "";
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(ruta);
    return acc;
  }, {});

  const ordenGrupos = ["Director", "Profesor", "Administrador"];

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-bold mb-6">Panel de bienvenida</h1>

      {ordenGrupos
        .filter((nombreGrupo) => grupos[nombreGrupo])
        .map((nombreGrupo) => (
          <section key={nombreGrupo}>
            <h2 className="text-2xl font-semibold mb-4">{nombreGrupo}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {grupos[nombreGrupo].map((elem) => (
                <div
                  key={elem.path}
                  onClick={() => navigate(elem.path)}
                  className="formulario-dentro"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{elem.nombre}</h3>
                    <button className="boton-detalles" type="button">
                      Ir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
