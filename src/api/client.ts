import axios from "axios";
import { translateErrorMessage } from "../i18n/errorMessages";
import { triggerGlobalError } from "../context/snackbar-context";

const client = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const backendMessage = error?.response?.data?.message;
    const translated = translateErrorMessage(backendMessage);
    triggerGlobalError(translated);
    return Promise.reject(error);
  }
);

export default client;
