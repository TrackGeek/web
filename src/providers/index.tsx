import type { ComponentType, ReactNode } from "react";
import { CookiesProvider } from "react-cookie";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { TanstackQueryProvider } from "./tanstack-query-provider";
import { TanstackDevtoolsProvider } from "./tanstack-devtools-provider";

interface ProviderProps {
	children: ReactNode;
}

const providers: ComponentType<ProviderProps>[] = [
	({ children }) => (
    <TooltipProvider>{children}</TooltipProvider>
  ),
	({ children }) => (
    <CookiesProvider>{children}</CookiesProvider>
  ),
	({ children }) => (
    <TanstackQueryProvider>{children}</TanstackQueryProvider>
  ),
	({ children }) => (
		<TanstackDevtoolsProvider>{children}</TanstackDevtoolsProvider>
	),
];

export function RootProvider({ children }: ProviderProps) {
	return (
		<>
			{providers.reduceRight(
				(acc, Provider, index) => (
					<Provider key={index + 1}>{acc}</Provider>
				),
				children,
			)}

			<Toaster position="top-center" closeButton />
		</>
	);
}
