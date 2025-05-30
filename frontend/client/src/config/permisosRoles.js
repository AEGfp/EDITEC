const permisosRoles = {
  //nombre de la entidad
  permisos: {
    //permisos
    lectura: ["director", "profesor"],
    escritura: ["director"],
  },
  infantes: {
    lectura: ["director", "profesor"],
    escritura: ["director"],
  },
  salas: {
    lectura: ["director", "profesor"],
    escritura: ["director"],
  },
  turnos: {
    lectura: ["director", "profesor"],
    escritura: ["director"],
  },
  tutores: {
    lectura: ["director", "profesor"],
    escritura: ["director"],
  },
  inscripciones: {
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
  },

  notificaciones: {
    lectura: ["director", "profesor"],   
    escritura: ["director", "administrador"],             
  },
};


export default permisosRoles;
