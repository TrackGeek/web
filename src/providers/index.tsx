import type { ReactNode } from "react";
import { CookiesProvider } from "react-cookie";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "./react-query-provider";

interface RootProviderProps {
	children: ReactNode;
}

export function RootProvider({ children }: RootProviderProps) {
	return (
		<>
			<CookiesProvider>
				<ReactQueryProvider>{children}</ReactQueryProvider>
			</CookiesProvider>

			<TanStackRouterDevtools position="bottom-left" />

			<Toaster position="top-center" closeButton />
		</>
	);
}
