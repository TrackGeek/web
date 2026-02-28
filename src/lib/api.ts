import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export namespace apiTypes {}

export const apiEndpoints = {
  profileAvatar: {
    patch: "/profile/avatar",
    delete: "/profile/avatar",
  },
  profileBanner: {
    patch: "/profile/banner",
    delete: "/profile/banner",
  },
};
