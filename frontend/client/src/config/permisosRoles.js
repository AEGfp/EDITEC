const permisosRoles = {
  //nombre de la entidad
  /*permisos: {
    //permisos
    lectura: ["director", "profesor"],
    escritura: ["director"],
  },*/
  asistencias: {
    lectura: ["director", "profesor"],
    escritura: ["director", "profesor"],
  },
  infantes: {
    lectura: ["director", "profesor", "tutor"],
    escritura: ["tutor"],
  },
  asistenciasHistorial: {
    lectura: ["director", "profesor", "tutor"],
    escritura: ["director", "profesor"],
  },
  salas: {
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
  },
  turnos: {
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
  },
  tutores: {
    lectura: ["director", "profesor", "tutor"],
    escritura: ["tutor"],
  },
  informes: {
    lectura: ["director", "profesor", "tutor"],
    escritura: ["director", "profesor"],
  },
  periodos: {
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
  },
  inscripciones: {
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
  },
  funcionarios: {
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
  },
  empresas: {
    //permisos
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
  },
  locales: {
    lectura: ["director", "administrador"],
    escritura: ["director"],
  },
  cuotas: {
    lectura: ["director", "administrador", "tutor"],
    escritura: ["director", "administrador"],
  },
  cajasCobros: {
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
  },
  parametros: {
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
  },
  notificaciones: {
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
  },

  proveedores: {
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
  },
  comprobantes: {
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
  },
  saldos: {
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
  },
  proveedores: {
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
  },
  cajasPagos: {
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
  },
  transferencias: {
    lectura: ["director"],
    escritura: ["director"],
  },
};

export default permisosRoles;
