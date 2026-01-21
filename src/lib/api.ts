import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export namespace apiTypes {
  export type RequestLoginType = 'discord' | 'google' | 'github' | 'email';
  
  export interface AuthMeResponse {
    user: {
      id: string;
      email: string;
      name: string;
    };
  }
}

export const apiEndpoints = {
  auth: {
    me: '/auth/me',
    logout: '/auth/logout',
    requestLogin: (type: apiTypes.RequestLoginType) => `/auth/${type}/request`,
  },
};

