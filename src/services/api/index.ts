import axios, { AxiosInstance } from "axios";

export const API_URL = "https://jsonplaceholder.typicode.com/";

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export default api;