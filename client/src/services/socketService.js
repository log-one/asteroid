import io from "socket.io-client";
import { getJwt, validateJwt } from "./authService";

const token = getJwt();
//check if jwt is valid
const tokenIsValid = validateJwt(token);
const ENDPOINT = process.env.REACT_APP_CHIT_URL;

let socket = io.connect(ENDPOINT, {
  query: { token: tokenIsValid ? token : "invalid" },
});

export default socket;
