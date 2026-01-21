import { useEffect, useState, type ReactNode } from 'react';
import { useCookies } from 'react-cookie';

import { AuthContext } from '@/contexts/auth-context';
import { useMutation } from '@tanstack/react-query';
import { openPopup } from '@/lib/utils';
import { api, apiEndpoints, type apiTypes } from '@/lib/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface AuthProviderProps {
 	children: ReactNode;
}

interface CookieValues {
  accessToken?: string;
  refreshToken?: string;
}

type CookieKeys = keyof CookieValues;

export function AuthProvider({ children }: AuthProviderProps) {
  const { t } = useTranslation();
  
  const [cookies] = useCookies<CookieKeys, CookieValues>(['accessToken', 'refreshToken']);
  
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [loginPopup, setLoginPopup] = useState<Window | null>(null);
  
  const authRequestLoginMutation = useMutation({
    mutationFn: (
      data: { type: apiTypes.RequestLoginType; payload?: Record<string, any> },
    ) => api.get(apiEndpoints.auth.requestLogin(data.type), { params: data.payload }),
    onSuccess: (response) => {
      if (!!response?.data?.url) {
        setLoginPopup(openPopup(response.data?.url, 600, 600));
      } else {
        toast.success(t("auth:enterYourEmail"))
      }
    },
    onError: () => toast.error(t("auth:failedToLogin")),
  });
  
  const authLogoutMutation = useMutation({
    mutationFn: () => api.get("/auth/logout"),
    onSuccess: () => {
      setAuthenticated(false);
      
      toast.success(t("auth:logoutSuccessful"));
    },
    onError: () => toast.error(t("auth:failedToLogout")),
  });
  
  useEffect(() => {
    if (!!cookies.accessToken) {
      setAuthenticated(true);
    }
  }, [cookies.accessToken])
  
  useEffect(() => {
    function handleListenPopupMessages(event: MessageEvent) {
      try {
        if (event.origin !== import.meta.env.VITE_API_URL) return;
        
        const data = JSON.parse(event.data) as Record<string, any>;
        
        if (!data || data?.type !== 'SUCCESS_LOGIN') {
          console.error(data)
          
          setAuthenticated(false)
          setLoginPopup(null)
          
          toast.error(t("auth:failedToLogin"));
          
          return;
        }
        
        setAuthenticated(true)
        
        toast.success(t("auth:loginSuccessful"));
        
        loginPopup?.close();
          
        setLoginPopup(null);
      } catch (error) {
        console.error(error)
        
        setAuthenticated(false)
        setLoginPopup(null)
        
        toast.error(t("auth:failedToLogin"));
      }
    }
    
    window.addEventListener('message', handleListenPopupMessages);

    return () => {
      window.removeEventListener('message', handleListenPopupMessages);
    };
  }, [])
  
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        hasLoginPopup: loginPopup !== null,
        requestLogin: (type, payload) => authRequestLoginMutation.mutate({ type, payload }),
        logout: () => authLogoutMutation.mutate(),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}