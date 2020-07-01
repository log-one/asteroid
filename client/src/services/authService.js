import http from "./httpService";
import { chatUrl, registerUrl, loginUrl } from "../config.json";

export async function login(user) {
  const response = await http.post(loginUrl, user);
  console.log("RESPONSE", response);
  return response;
}

export function toChat() {}
