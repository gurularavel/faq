import axios from "axios";
const clearData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
const api = import.meta.env.VITE_CONTROL_API_URL;
const app_token = import.meta.env.VITE_CONTROL_TOKEN;

axios.defaults.baseURL = api;

axios.interceptors.request.use(
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

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      clearData();
      window.location.href = window.location.origin + "/auth/control";
      throw error;
    }
    return Promise.reject(error);
  }
);

export const controlPrivateApi = axios;
