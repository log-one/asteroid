import ky from "ky";
import axios from "axios";

// export function errorHandling() {
//     const isExpectedError =
// }

export default {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
};
