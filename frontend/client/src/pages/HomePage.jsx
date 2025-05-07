import SubirArchivos from "../components/SubirArchivos";
import ConsultarArchivos from "../components/ConsultarArchivos";

export default function HomePage() {
  return (
    <div>
      <h1>Home Page</h1>

      <ConsultarArchivos></ConsultarArchivos>

      <br />
      <SubirArchivos></SubirArchivos>
    </div>
  );
}
