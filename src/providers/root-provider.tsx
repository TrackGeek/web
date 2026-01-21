import type { ReactNode } from 'react';
import { CookiesProvider } from 'react-cookie';

import { Toaster } from '@/components/ui/sonner';
import { ReactQueryProvider } from './react-query-provider';
import { AuthProvider } from './auth-provider';

interface RootProviderProps {
  children: ReactNode;
}

export function RootProvider({ children }: RootProviderProps) {
  return (
    <>
      <CookiesProvider>
        <ReactQueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ReactQueryProvider>
      </CookiesProvider>
      
      <Toaster position="top-center" closeButton />
    </>
  )
}