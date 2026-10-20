import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { useRefreshBookCovers } from "@/hooks/use-refresh-book-covers";
import { queryClient } from "@/lib/tanstack-query";

interface TanstackQueryProviderProps {
  children: ReactNode;
}

export function TanstackQueryProvider({ children }: TanstackQueryProviderProps) {
  useRefreshBookCovers();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
