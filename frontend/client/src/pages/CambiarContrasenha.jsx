import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

export default function CambiarContrasenha() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async ({ password, confirm_password }) => {
    if (password !== confirm_password) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    try {
      await axios.post(
        `http://localhost:8000/api/reset-password/${uid}/${token}/`,
        { password }
      );
      setSuccess("Contraseña restablecida correctamente.");
      setError("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.error ||
          "Ocurrió un error. Verifica que el enlace sea válido."
      );
      setSuccess("");
    }
  };

  return (
    <form className="formulario" onSubmit={handleSubmit(onSubmit)}>
      <div className="formulario-dentro">
        <h2 className="formulario-titulo">Restablecer contraseña</h2>
        <input
          className="formulario-input"
          type="password"
          {...register("password", { required: true })}
          placeholder="Nueva contraseña"
        />
        {errors.password && (
          <p className="mensaje-error">{errors.password.message}</p>
        )}
        <br />
        <input
          className="formulario-input"
          type="password"
          {...register("confirm_password", { required: true })}
          placeholder="Confirmar nueva contraseña"
        />
        {errors.confirm_password && (
          <p className="mensaje-error">{errors.confirm_password.message}</p>
        )}
        <br />
        {error && <p className="mensaje-error">{error}</p>}
        {success && <p className="mensaje-exito">{success}</p>}
        <br />
        <div className="botones-grupo">
          <button className="boton-guardar" type="submit">
            Cambiar contraseña
          </button>
        </div>
      </div>
    </form>
  );
}
