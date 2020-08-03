import io from "socket.io-client";

const ENDPOINT = "https://elgemo.herokuapp.com/";

let socket = io(ENDPOINT);

export default socket;
