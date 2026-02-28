import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { queryClient } from "@/lib/tanstack-query";

interface TanstackQueryProviderProps {
  children: ReactNode;
}

export function TanstackQueryProvider({ children }: TanstackQueryProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
