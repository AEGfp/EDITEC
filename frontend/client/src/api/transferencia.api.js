// transferencia.api.js
import { Api } from "./api";

const ENDPOINT = "educativo/transferir-infante/";

export const transferirInfante = (data) => Api.post(ENDPOINT, data);
