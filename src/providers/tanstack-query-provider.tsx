import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { useRefreshLocalizedMedia } from "@/hooks/use-refresh-localized-media";
import { queryClient } from "@/lib/tanstack-query";

interface TanstackQueryProviderProps {
  children: ReactNode;
}

export function TanstackQueryProvider({ children }: TanstackQueryProviderProps) {
  useRefreshLocalizedMedia();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
