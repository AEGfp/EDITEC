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
    path: "/tutores",
    componente: TutoresList,
    publico: true,
    nombre: "Tutores",
    subrutas: [
      {
        path: "/tutores-crear",
        componente: TurnosFormPage,
        publico: true,
        nombre: "Añadir turores",
      },
    ],
  },
];
