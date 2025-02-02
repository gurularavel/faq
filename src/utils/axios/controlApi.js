import axios from "axios";

const api = import.meta.env.VITE_CONTROL_API_URL;
const app_token = import.meta.env.VITE_CONTROL_TOKEN;

axios.defaults.baseURL = api;

export const controlApi = axios.create({
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
    "Accept-Language": JSON.parse(localStorage.getItem("lang"))?.key ?? "az",
    Token: app_token,
  },
});
