import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CampoRequerido from "./CampoRequerido";
import { crearInfante } from "../api/infantes.api"; // asumido

export default function CamposInfante({ register, errors }) {
  return (
    <div className="formulario-dentro">
      <h2 className="formulario-titulo">Datos del Infante</h2>

      <h4 className="formulario-elemento">Nombre</h4>
      <input
        className="formulario-input"
        {...register("infante_nombre", { required: true })}
      />
      {errors.infante_nombre && <CampoRequerido />}

      <h4 className="formulario-elemento">Apellido</h4>
      <input
        className="formulario-input"
        {...register("infante_apellido", { required: true })}
      />
      {errors.infante_apellido && <CampoRequerido />}

      <h4 className="formulario-elemento">Segundo Apellido</h4>
      <input
        className="formulario-input"
        {...register("infante_segundo_apellido")}
      />

      <h4 className="formulario-elemento">CI</h4>
      <input
        className="formulario-input"
        {...register("infante_ci", { required: true })}
      />
      {errors.infante_ci && <CampoRequerido />}

      <h4 className="formulario-elemento">Fecha de Nacimiento</h4>
      <input
        type="date"
        className="formulario-input"
        {...register("infante_fecha_nacimiento", { required: true })}
      />
      {errors.infante_fecha_nacimiento && <CampoRequerido />}

      <h4 className="formulario-elemento">Sexo</h4>
      <select
        className="formulario-input"
        {...register("infante_sexo", { required: true })}
      >
        <option value="">Seleccione</option>
        <option value="M">Masculino</option>
        <option value="F">Femenino</option>
      </select>
      {errors.infante_sexo && <CampoRequerido />}

      <h4 className="formulario-elemento">Domicilio</h4>
      <input className="formulario-input" {...register("infante_domicilio")} />

      <h4 className="formulario-elemento">¿Alergia?</h4>
      <select className="formulario-input" {...register("ind_alergia")}>
        <option value="N">No</option>
        <option value="S">Sí</option>
      </select>

      <h4 className="formulario-elemento">¿Intolerancia a la lactosa?</h4>
      <select
        className="formulario-input"
        {...register("ind_intolerancia_lactosa")}
      >
        <option value="N">No</option>
        <option value="S">Sí</option>
      </select>

      <h4 className="formulario-elemento">¿Celiaquismo?</h4>
      <select className="formulario-input" {...register("ind_celiaquismo")}>
        <option value="N">No</option>
        <option value="S">Sí</option>
      </select>

      <h4 className="formulario-elemento">¿Permiso para cambiar pañal?</h4>
      <select
        className="formulario-input"
        {...register("permiso_cambio_panhal")}
      >
        <option value="N">No</option>
        <option value="S">Sí</option>
      </select>

      <h4 className="formulario-elemento">¿Permiso para fotos?</h4>
      <select className="formulario-input" {...register("permiso_fotos")}>
        <option value="N">No</option>
        <option value="S">Sí</option>
      </select>
    </div>
  );
}
