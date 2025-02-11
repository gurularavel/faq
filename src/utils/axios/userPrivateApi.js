import axios from "axios";
import { userApi } from "./userApi";
const clearData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
const api = import.meta.env.VITE_APP_API_URL;
const app_token = import.meta.env.VITE_APP_TOKEN;

// axios.defaults.baseURL = api;

userApi.interceptors.request.use(
  async (config) => {
    const access_token = localStorage.getItem("token");

    if (access_token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${access_token}`,
        "Accept-Language":
          JSON.parse(localStorage.getItem("lang"))?.key ?? "az",
        Token: app_token,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

userApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      clearData();
      window.location.href = window.location.origin + "/auth/login";
      throw error;
    }
    return Promise.reject(error);
  }
);

export const userPrivateApi = userApi;
