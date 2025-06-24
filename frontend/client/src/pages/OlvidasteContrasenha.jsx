import { useForm } from "react-hook-form";
import axios from "axios";

export default function OlvidasteContrasenha() {
  const { register, handleSubmit } = useForm();
  const onSubmit = async ({ email }) => {
    try {
      await axios.post("http://localhost:8000/api/reset-password/", { email });

      alert(
        "Si el correo está registrado, se enviará un enlace de recuperación."
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form className="formulario" onSubmit={handleSubmit(onSubmit)}>
      <div className="formulario-dentro">
        <h2 className="formulario-titulo">¿Olvidaste tu contraseña?</h2>
        <input
          className="formulario-input"
          type="email"
          {...register("email", { required: true })}
          placeholder="Tu correo electrónico"
        />
        <br />
        <br />
        <div className="botones-grupo">
          <button className="boton-guardar" type="submit">
            Enviar
          </button>
        </div>
      </div>
    </form>
  );
}
