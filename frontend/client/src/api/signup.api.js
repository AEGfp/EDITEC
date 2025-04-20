import { Api } from "./api";

export const signUpApi = ({ username, password, groups, persona }) => {
  return Api.post("register/", { username, password, groups, persona });
};
