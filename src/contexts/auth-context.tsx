import { createContext } from 'react';

import type { apiTypes } from '@/lib/api';

interface AuthContextProps {
  isAuthenticated: boolean;
  hasLoginPopup: boolean;
  requestLogin: (type: apiTypes.RequestLoginType, payload?: Record<string, any>) => any;
  logout: () => any;
}

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);