import { Api } from "./api";

export const loginApi = ({ username, password }) => {
  return Api.post("login/", { username, password });
};
