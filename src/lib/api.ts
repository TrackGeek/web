import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    
    if (originalRequest.url?.includes('/auth/refresh')) {
      isRefreshing = false;
      
      processQueue(error);
      
      window.location.href = '/';
      
      return Promise.reject(error);
    }
    
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
    }
    
    originalRequest._retry = true;
    
    isRefreshing = true;
    
    try {
      await api.get('/auth/refresh');
      
      isRefreshing = false;
      
      processQueue();
      
      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      
      processQueue(refreshError);
      
      await api.get('/auth/logout').catch(() => {});
      
      window.location.href = '/';
      
      return Promise.reject(refreshError);
    }
  }
);

export namespace apiTypes {
  export interface User {
    id: string;
    name: string;
    username: string;
    email?: string;
    color?: string;
    language?: string;
    about?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    createdAt: Date;
  }
  
  export interface MeResponse {
    user: User;
  }
}

export const apiEndpoints = {
  me: {
    get: '/auth/me',
    patch: '/auth/me',
  },
  meAvatar: {
    post: '/auth/me/avatar',
    delete: '/auth/me/avatar',
  },
  meBanner: {
    post: '/auth/me/banner',
    delete: '/auth/me/banner',
  },
  refresh: {
    get: '/auth/refresh',
  },
  logout: {
    get: '/auth/logout',
  },
  requestEmailLogin: {
    get: '/auth/email/request'
  },
  requestGoogleLogin: {
    get: '/auth/google/request'
  },
  requestDiscordLogin: {
    get: '/auth/discord/request'
  },
  requestGithubLogin: {
    get: '/auth/github/request'
  },
};

