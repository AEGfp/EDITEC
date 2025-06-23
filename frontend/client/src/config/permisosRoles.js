const permisosRoles = {
  //nombre de la entidad
  /*permisos: {
    //permisos
    lectura: ["director", "profesor"],
    escritura: ["director"],
  },*/
  empresas: {
    //permisos
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
  },
  asistencias: {
    lectura: ["director", "profesor"],
    escritura: ["director", "profesor"],
  },
  asistenciasHistorial: {
    lectura: ["director", "profesor", "tutor"],
    escritura: ["director", "profesor"],
  },
  locales: {
    lectura: ["director", "administrador"],
    escritura: ["director"],
  },
  infantes: {
    lectura: ["director", "profesor", "tutor"],
    escritura: ["tutor"],
  },
  cuotas: {
    lectura: ["director", "profesor", "tutor"],
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
  periodos: {
    lectura: ["director", "administrador"],
    escritura: ["director", "administrador"],
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
  informes: {
    lectura: ["director", "profesor", "tutor"],
    escritura: ["director", "profesor"],
  },
  transferencias: {
    lectura: ["director"],
    escritura: ["director"],
  },
};

export default permisosRoles;
