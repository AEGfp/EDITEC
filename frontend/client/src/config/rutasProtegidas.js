import { PermisosPage } from "../pages/PermisosPage";
import { PermisosFormPage } from "../pages/PermisosFormPage";
import InfantesList from "../pages/InfantesList";
import InfanteForm from "../pages/InfantesForm";
import SalasList from "../pages/SalasList";
import SalasFormPage from "../pages/SalasFormPage";
import TurnosFormPage from "../pages/TurnosFormPage";
import TurnosList from "../pages/TurnosList";
import TutoresList from "../pages/TutoresList";
import TutoresFormPage from "../pages/TutoresFormPage";
import HomePage from "../pages/HomePage";
import InscripcionesFormPage from "../pages/InscripcionesFormPage";
import GestionInscripcionesPage from "../pages/GestionInscripcionesPage";
import NotificacionesFormPage from "../pages/NotificacionesFormPage";
import NotificacionesList from "../pages/NotificacionesList";
import { EmpresasPage } from "../pages/EmpresasPage";
import { EmpresasFormPage } from "../pages/EmpresasFormPage";
import FuncionariosPage from "../pages/FuncionariosPage";
import FuncionariosFormPage from "../pages/FuncionariosFormPage";
import { LocalesPage } from "../pages/LocalesPage";
import { LocalesFormPage } from "../pages/LocalesFormPage";
import { ProveedoresPage } from "../pages/ProveedoresPage";
import { ProveedoresFormPage } from "../pages/ProveedoresFormPage";
import { ComprobantesFormPage } from "../pages/ComprobantesFormPage";
import { ComprobantesPage } from "../pages/ComprobantesPage";
import { SaldosProveedoresPage } from "../pages/SaldosProveedoresPage";
import AsistenciasPage from "../pages/AsistenciasPage";
import { CajasPagosPage } from "../pages/CajasPagosPage";
import { CajasPagosFormPage } from "../pages/CajasPagosFormPage";
import { InformesFormPage } from "../pages/InformesFormPage";
import { InformesPage } from "../pages/InformesPage";
import TransferenciaInfantePage from "../pages/TransferenciaInfantePage";
import { CuotasPage } from "../pages/CuotasPage";
import { ParametrosFormPage } from "../pages/ParametrosFormPage";
import { ParametrosPage } from "../pages/ParametrosPage";
import PeriodosPage from "../pages/PeriodosPage";
import PeriodosFormPage from "../pages/PeriodosFormPage";

export default [
  {
    path: "/home",
    componente: HomePage,
    publico: true, //necesita permiso para acceder?
    nombre: "Inicio",
  },
  {
    path: "/asistencias", //url
    componente: AsistenciasPage, //.jsx
    entidad: "asistencias", //tabla con la que interactúa
    permiso: "lectura", //permisos minimos
    nombre: "Asistencias", //Nombre del elemento en el Sidebar
    /*    subrutas: [
      {
        path: "/crear-comprobante",
        componente: ComprobantesFormPage,
        entidad: "comprobantes",
        permiso: "escritura",
        nombre: "Crear Comprobante",
      },
    ],*/
  },
  {
    path: "/empresas", //url
    componente: EmpresasPage, //.jsx
    entidad: "empresas", //tabla con la que interactúa
    permiso: "lectura", //permisos minimos
    nombre: "Empresas", //Nombre del elemento en el Sidebar
    subrutas: [
      {
        path: "/crear-empresa",
        componente: EmpresasFormPage,
        entidad: "empresas",
        permiso: "escritura",
        nombre: "Crear Empresa",
      },
    ],
  },
  {
    path: "/empresas/:id",
    componente: EmpresasFormPage,
    entidad: "empresas",
    permiso: "lectura",
  },
  {
    path: "/locales", //url
    componente: LocalesPage, //.jsx
    entidad: "locales", //tabla con la que interactúa
    permiso: "lectura", //permisos minimos
    nombre: "Sucursales", //Nombre del elemento en el Sidebar
    subrutas: [
      {
        path: "/crear-sucursal",
        componente: LocalesFormPage,
        entidad: "locales",
        permiso: "escritura",
        nombre: "Crear Sucursal",
      },
    ],
  },
  {
    path: "/locales/:id",
    componente: LocalesFormPage,
    entidad: "locales",
    permiso: "lectura",
  },
  /* {
    path: "/permisos", //url
    componente: PermisosPage, //.jsx
    entidad: "permisos", //tabla con la que interactúa
    permiso: "lectura", //permisos minimos
    nombre: "Permisos", //Nombre del elemento en el Sidebar
    subrutas: [
      {
        path: "/permisos-crear",
        componente: PermisosFormPage,
        entidad: "permisos",
        permiso: "escritura",
        nombre: "Crear Permisos",
      },
    ],
  },
  {
    path: "/permisos/:id",
    componente: PermisosFormPage,
    entidad: "permisos",
    permiso: "lectura",
  },*/
  {
    path: "/infantes",
    componente: InfantesList,
    entidad: "infantes",
    permiso: "lectura",
    nombre: "Infantes",
    /* subrutas: [
      {
        path: "/infantes-crear",
        componente: InfanteForm,
        entidad: "infantes",
        permiso: "escritura",
        nombre: "Añadir infante",
      },
    ],*/
  },

  {
    path: "/infantes/:id",
    componente: InfanteForm,
    entidad: "infantes",
    permiso: "lectura",
  },

  {
    path: "/parametros", //url
    componente: ParametrosPage, //.jsx
    entidad: "parametros", //tabla con la que interactúa
    permiso: "lectura", //permisos minimos
    nombre: "Parametros Cobros", //Nombre del elemento en el Sidebar
    subrutas: [
      {
        path: "/crear-parametro",
        componente: ParametrosFormPage,
        entidad: "parametros",
        permiso: "escritura",
        //nombre: "Crear Permisos",
      },
    ],
  },
  {
    path: "/parametros/:id",
    componente: ParametrosFormPage,
    entidad: "parametros",
    permiso: "lectura",
  },
  {
    path: "/cuotas", //url
    componente: CuotasPage, //.jsx
    entidad: "cuotas", //tabla con la que interactúa
    permiso: "lectura", //permisos minimos
    nombre: "Cuotas", //Nombre del elemento en el Sidebar
    /*subrutas: [
      {
        path: "/permisos-crear",
        componente: PermisosFormPage,
        entidad: "permisos",
        permiso: "escritura",
        nombre: "Crear Permisos",
      },
    ],*/
  },
  {
    path: "/cuotas-por-infante/:id",
    componente: CuotasPage,
    entidad: "cuotas",
    permiso: "lectura",
  },

  {
    path: "/salas",
    componente: SalasList,
    entidad: "salas",
    permiso: "lectura",
    nombre: "Salas",
    subrutas: [
      {
        path: "/salas-crear",
        componente: SalasFormPage,
        entidad: "salas",
        permiso: "escritura",
        nombre: "Crear salas",
      },
    ],
  },
  {
    path: "/salas/:id", // <-- ESTA LÍNEA AGREGA LA EDICIÓN
    componente: SalasFormPage,
    entidad: "salas",
    permiso: "lectura",
  },
  /*
  {
    path: "/turnos",
    componente: TurnosList,
    entidad: "turnos",
    permiso: "lectura",
    nombre: "Turnos",
    subrutas: [
      {
        path: "/turnos-crear",
        componente: TurnosFormPage,
        entidad: "escritura",
        permiso: "escritura",
        nombre: "Crear turnos",
      },
    ],
  },
  {
    path: "/turnos/:id",
    componente: TurnosFormPage,
    entidad: "turnos",
    permiso: "lectura",
  },
*/
  {
    path: "/tutores",
    componente: TutoresList,
    entidad: "tutores",
    permiso: "lectura",
    nombre: "Tutores",
    /* subrutas: [
      {
        path: "/tutores-crear",
        componente: TutoresFormPage,
        entidad: "tutores",
        permiso: "escritura",
        nombre: "Añadir turores",
      },
    ],*/
  },
  {
    path: "/tutores/:id",
    componente: TutoresFormPage,
    entidad: "tutores",
    permiso: "lectura",
  },
  {
    path: "/inscripciones",
    componente: GestionInscripcionesPage,
    entidad: "inscripciones",
    permiso: "lectura",
    nombre: "Inscripciones",
  },
  {
    path: "/inscripciones/:id",
    componente: InscripcionesFormPage,
    entidad: "inscripciones",
    permiso: "lectura",
  },
  {
    path: "/notificaciones",
    componente: NotificacionesList,
    nombre: "Notificaciones",
    entidad: "notificaciones",
    permiso: "lectura",
    subrutas: [
      {
        path: "/notificaciones-crear",
        componente: NotificacionesFormPage,
        entidad: "notificaciones",
        permiso: "escritura",
        nombre: "Crear notificación",
      },
    ],
  },
  {
    path: "/notificaciones/:id",
    componente: NotificacionesFormPage,
    entidad: "notificaciones",
    permiso: "lectura",
  },
  {
    path: "/funcionarios",
    componente: FuncionariosPage,
    nombre: "Funcionarios",
    entidad: "funcionarios",
    permiso: "lectura",
    subrutas: [
      {
        path: "/funcionarios-crear",
        componente: FuncionariosFormPage,
        entidad: "funcionarios",
        permiso: "escritura",
        nombre: "Añadir funcionario",
      },
    ],
  },
  {
    path: "/funcionarios/:id",
    componente: FuncionariosFormPage,
    entidad: "funcionarios",
    permiso: "lectura",
  },
  {
    path: "/proveedores", //url
    componente: ProveedoresPage, //.jsx
    entidad: "proveedores", //tabla con la que interactúa
    permiso: "lectura", //permisos minimos
    nombre: "Proveedores", //Nombre del elemento en el Sidebar
    subrutas: [
      {
        path: "/crear-proveedor",
        componente: ProveedoresFormPage,
        entidad: "proveedores",
        permiso: "escritura",
        nombre: "Crear Proveedor",
      },
    ],
  },
  {
    path: "/proveedores/:id",
    componente: ProveedoresFormPage,
    entidad: "proveedores",
    permiso: "lectura",
  },
  {
    path: "/comprobantes", //url
    componente: ComprobantesPage, //.jsx
    entidad: "comprobantes", //tabla con la que interactúa
    permiso: "lectura", //permisos minimos
    nombre: "Comprobantes de Gasto", //Nombre del elemento en el Sidebar
    subrutas: [
      {
        path: "/crear-comprobante",
        componente: ComprobantesFormPage,
        entidad: "comprobantes",
        permiso: "escritura",
        nombre: "Crear Comprobante",
      },
    ],
  },
  {
    path: "/comprobantes/:id",
    componente: ComprobantesFormPage,
    entidad: "comprobantes",
    permiso: "lectura",
  },
  {
    path: "/saldos", //url
    componente: SaldosProveedoresPage, //.jsx
    entidad: "saldos", //tabla con la que interactúa
    permiso: "lectura", //permisos minimos
    nombre: "Saldos de Proveedores", //Nombre del elemento en el Sidebar
    subrutas: [
      /*{
        path: "/ver-saldo",
        componente: SaldosProveedoresPage,
        entidad: "saldos",
        permiso: "lectura",
        //nombre: "Crear Comprobante",
      },*/
    ],
  },
  {
    path: "/saldos/:id",
    componente: SaldosProveedoresPage,
    entidad: "saldos",
    permiso: "lectura",
  },
  {
    path: "/caja-pagos", //url
    componente: CajasPagosPage, //.jsx
    entidad: "cajasPagos", //tabla con la que interactúa
    permiso: "lectura", //permisos minimos
    nombre: "Caja Pagos", //Nombre del elemento en el Sidebar
    subrutas: [
      {
        path: "/crear-caja-pago",
        componente: CajasPagosFormPage,
        entidad: "cajasPagos",
        permiso: "escritura",
        nombre: "Registrar Pago",
      },
    ],
  },
  {
    path: "/caja-pagos/:id",
    componente: CajasPagosFormPage,
    entidad: "cajasPagos",
    permiso: "lectura",
  },
  {
    path: "/informes", //url
    componente: InformesPage, //.jsx
    entidad: "informes", //tabla con la que interactúa
    permiso: "lectura", //permisos minimos
    nombre: "Informes", //Nombre del elemento en el Sidebar
    subrutas: [
      {
        path: "/crear-informe",
        componente: InformesFormPage,
        entidad: "informes",
        permiso: "escritura",
        nombre: "Crear informe",
      },
    ],
  },
  /*{
    path: "/informes/:id",
    componente: InformesFormPage,
    entidad: "informes",
    permiso: "lectura",
  },*/
  {
    path: "/transferencias",
    componente: TransferenciaInfantePage,
    publico: true,
    nombre: "Transferencia",
  },
  {
    path: "/periodos", //url
    componente: PeriodosPage, //.jsx
    entidad: "periodos", //tabla con la que interactúa
    permiso: "lectura", //permisos minimos
    nombre: "Periodos", //Nombre del elemento en el Sidebar
    subrutas: [
      {
        path: "/periodos-crear",
        componente: PeriodosFormPage,
        entidad: "periodos",
        permiso: "escritura",
        nombre: "Crear Periodos",
      },
    ],
  },
  {
    path: "/periodos/:id",
    componente: PeriodosFormPage,
    entidad: "periodos",
    permiso: "lectura",
  },
];
