import { Api } from "./api";

export const signUpApi = ({ username, email, password, groups, persona }) => {
  return Api.post("register/", { username, email, password, groups, persona });
};
