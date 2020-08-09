import io from "socket.io-client";
import { getCurrentUser, getJwt } from "./authService";

const token = getJwt();
const ENDPOINT = process.env.REACT_APP_CHIT_URL;

let socket = io.connect(ENDPOINT, { query: { token } });

export default socket;
