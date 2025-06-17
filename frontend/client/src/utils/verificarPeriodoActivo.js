import { periodoAbierto } from "../api/periodos.api";

export async function verificarPeriodoActivo() {
  try {
    const res = await periodoAbierto();
    return res.data;
  } catch (error) {
    return null;
  }
}
