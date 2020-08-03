import http from "./httpService";
import jwtDecode from "jwt-decode";
import { appUrl, loginUrl } from "../config.json";

const tokenKey = "token";

export async function login(user) {
  const { headers } = await http.post(loginUrl, user);
  const jwt = headers["x-auth-token"];
  localStorage.setItem(tokenKey, jwt);
}

export function loginWithJwt(jwt) {
  localStorage.setItem(tokenKey, jwt);
}

export function getJwt() {
  if (!localStorage.getItem(tokenKey)) return "";
  return localStorage.getItem(tokenKey);
}

export async function validateJwt() {
  //pass jwt to the httpServices module to add x-auth-token header to all requests
  http.setJwt(getJwt());
  try {
    await http.get(appUrl);
    return true;
  } catch (ex) {
    console.log(ex);
    return false;
  }
}

export function getCurrentUser() {
  try {
    const jwt = localStorage.getItem(tokenKey);
    //send token to server to check if its valid?????????????

    //console.log("HEY");
    // if (!(await validateJwt())) {
    //   console.log("FOR THE LUV OF GOD");
    //   return "";
    // }
    //if token is valid then extract payload and render home else redirect to login page

    const { name } = jwtDecode(jwt);
    //if payload is successfully extracted from jwt, emit "join" event
    return name;
  } catch (ex) {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(tokenKey);
  window.location.reload();
}
