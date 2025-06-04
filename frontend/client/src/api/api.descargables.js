import { Api } from "./api";

//Cambiar según la url del backend
const DIRECCION = "archivos/";
const HEADERS = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

export const descargarArchivo = async (nombre) => {
  const res = await Api.get(`${DIRECCION}descargables/${nombre}`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;

  const contentDisposition =
    res.headers["content-disposition"] || res.headers["Content-Disposition"];
  let nombreArchivo = "archivo";

  if (contentDisposition) {
    //Codificacion utf-8
    let match = contentDisposition.match(/filename\*=UTF-8''(.+)/i);
    if (match && match[1]) {
      nombreArchivo = decodeURIComponent(match[1]);
    } else {
      //Nombre normal
      match = contentDisposition.match(/filename="?([^"]+)"?/i);
      if (match && match[1]) {
        nombreArchivo = match[1];
      }
    }
  }

  link.setAttribute("download", nombreArchivo);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
