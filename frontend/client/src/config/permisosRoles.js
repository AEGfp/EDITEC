const permisosRoles = {
  //nombre de la entidad
  permisos: {
    //permisos
    lectura: ["director", "profesor"],
    escritura: ["director"],
  },
  empresas: {
    //permisos
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
  },
  asistencias: {
    lectura: ["director", "profesor"],
    escritura: ["director", "profesor"],
  },
  locales: {
    //permisos
    lectura: ["director", "administrador"],
    escritura: ["director"],
  },
  infantes: {
    lectura: ["director", "profesor"],
    escritura: ["director"],
  },
  salas: {
    lectura: ["director", "administrador"],
    escritura: ["director"],
  },
  turnos: {
    lectura: ["director", "administrador"],
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
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
  },
  funcionarios: {
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
  },
  proveedores: {
    //permisos
    lectura: ["director", "profesor"],
    escritura: ["director"],
  },
  comprobantes: {
    //permisos
    lectura: ["director", "profesor"],
    escritura: ["director"],
  },
  saldos: {
    //permisos
    lectura: ["director", "profesor"],
    escritura: ["director"],
  },
  proveedores: {
    //permisos
    lectura: ["director", "profesor"],
    escritura: ["director"],
  },
  comprobantes: {
    //permisos
    lectura: ["director", "profesor"],
    escritura: ["director"],
  },
  saldos: {
    //permisos
    lectura: ["director", "profesor"],
    escritura: ["director"],
  },
};

export default permisosRoles;
