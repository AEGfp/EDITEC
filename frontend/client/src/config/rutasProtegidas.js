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

export default [
  {
    path: "/home",
    componente: HomePage,
    publico: true, //necesita permiso para acceder?
    nombre: "Inicio",
  },
  {
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
  },
  {
    path: "/infantes",
    componente: InfantesList,
    publico: true,
    nombre: "Infantes",
    subrutas: [
      {
        path: "/infantes-crear",
        componente: InfanteForm,
        publico: true,
        nombre: "Añadir infantes",
      },
    ],
  },

  {
    path: "/infantes/:id",
    componente: InfanteForm,
    publico: true,
  },
  {
    path: "/salas",
    componente: SalasList,
    publico: true,
    nombre: "Salas",
    subrutas: [
      {
        path: "/salas-crear",
        componente: SalasFormPage,
        publico: true,
        nombre: "Crear salas",
      },
    ],
  },
  {
    path: "/salas/:id", // <-- ESTA LÍNEA AGREGA LA EDICIÓN
    componente: SalasFormPage,
    publico: true,
  },

  {
    path: "/turnos",
    componente: TurnosList,
    publico: true,
    nombre: "Turnos",
    subrutas: [
      {
        path: "/turnos-crear",
        componente: TurnosFormPage,
        publico: true,
        nombre: "Crear turnos",
      },
    ],
  },
  {
    path: "/turnos/:id",
    componente: TurnosFormPage,
    publico: true,
  },

  {
    path: "/tutores",
    componente: TutoresList,
    publico: true,
    nombre: "Tutores",
    subrutas: [
      {
        path: "/tutores-crear",
        componente: TutoresFormPage,
        publico: true,
        nombre: "Añadir turores",
      },
    ],
  },
  {
    path: "/tutores/:id",
    componente: TutoresFormPage,
    publico: true,
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
    entidad: "permisos",
    permiso: "lectura",
  },

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
  
  {
    path: "/notificaciones/:id",
    componente: NotificacionesFormPage,
    entidad: "notificaciones",
    permiso: "lectura",
  },
  
];
