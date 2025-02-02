import axios from "axios";

const api = import.meta.env.VITE_APP_API_URL;
const app_token = import.meta.env.VITE_APP_TOKEN;

axios.defaults.baseURL = api;

export const userApi = axios.create({
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
    "Accept-Language": JSON.parse(localStorage.getItem("lang"))?.key ?? "az",
    Token: app_token,
  },
});
