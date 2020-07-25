import http from "./httpService";
import { registerUrl } from "../config.json";

export async function register(user) {
  return await http.post(registerUrl, user);
}
