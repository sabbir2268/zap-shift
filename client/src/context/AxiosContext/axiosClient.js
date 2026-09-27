import axios from "axios";
import { getAuth } from "firebase/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

/* handlers registered by AuthProvider, so a rejected request can react to a
   role that changed while the session was open */
const forbiddenHandlers = new Set();

export const onForbidden = (handler) => {
  forbiddenHandlers.add(handler);
  return () => forbiddenHandlers.delete(handler);
};

api.interceptors.request.use(async (config) => {
  /* let the browser set the multipart boundary itself, otherwise the json
     default below would serialise the form instead of sending it */
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete?.("Content-Type");
  }

  const user = getAuth().currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error.response?.status;
    const original = error.config;

    /* the token can expire mid session. grab a fresh one and replay the
       request once before giving up */
    if (status === 401 && original && !original._retried) {
      const user = getAuth().currentUser;

      if (user) {
        original._retried = true;
        original.headers.Authorization = `Bearer ${await user.getIdToken(true)}`;

        try {
          return await api(original);
        } catch {
          /* the replay failed too, fall through to the error below */
        }
      }
    }

    /* 403 means the role we are holding is stale, most likely just taken away.
       a 401 is not reported here, firebase already reacts to a dead session */
    if (status === 403) {
      forbiddenHandlers.forEach((handler) => handler(error));
    }

    const message =
      status === 403
        ? "You do not have permission to do that"
        : error.response?.data?.message ||
          error.message ||
          "Something went wrong";

    const failure = new Error(message);
    failure.status = status;

    return Promise.reject(failure);
  }
);

export default api;
