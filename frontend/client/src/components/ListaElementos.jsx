import Elemento from "./Elemento";

export default function ListaElementos({ lista }) {
  return (
    <>
      <h1>Lista de Elementos</h1>
      <div>
        {lista.map((elem) => (
          <div key={elem.id}>
            <Elemento elemento={elem} />
          </div>
        ))}
      </div>
    </>
  );
}
