// controlApi.js
import axios from "axios";

const api = import.meta.env.VITE_CONTROL_API_URL;
const app_token = import.meta.env.VITE_CONTROL_TOKEN;

export const controlApi = axios.create({
  baseURL: api,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
    "Accept-Language": JSON.parse(localStorage.getItem("lang"))?.key ?? "az",
    Token: app_token,
  },
});
