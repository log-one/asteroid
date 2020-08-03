import axios from "axios";

// export function errorHandling() {
//     const isExpectedError =
// }

axios.defaults.baseURL = process.env.REACT_APP_CHIT_URL;

function setJwt(jwt) {
  axios.defaults.headers.common["x-auth-token"] = jwt;
}

export default {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
  setJwt,
};
