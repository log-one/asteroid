import http from "./httpService";
import { chatUrl, registerUrl, loginUrl } from "../config.json";

export async function register(user) {
  const response = await http.post(registerUrl, user);
  console.log("RESPONSE", response);
  return response;
}

export function toChat() {}
