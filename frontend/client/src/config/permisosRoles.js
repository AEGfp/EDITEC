const permisosRoles = {
  //nombre de la entidad
  permisos: {
    //permisos
    lectura: ["director", "profesor"],
    escritura: ["director"],
  },
  empresas: {
    //permisos
    lectura: ["director", "profesor"],
    escritura: ["director","administrador"],
  },
  locales: {
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
