import "@/lib/i18n/config.ts";
import "@/global.css";

import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";

import { RootProvider } from "@/providers";
import { MainLayout } from "@/components/layouts/main";
import type { authClient } from "@/lib/auth";
import { HomeLayout } from '@/components/layouts/home';

interface RouterContext {
	auth: typeof authClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootLayout,
});

function RootLayout() {
	const { location } = useRouterState();
  
	const isHome = location.pathname === "/";

	return (
		<>
			<HeadContent />

			<RootProvider>
				{isHome ? (
          <HomeLayout>
            <Outlet />
          </HomeLayout>
				) : (
					<MainLayout>
						<Outlet />
					</MainLayout>
				)}
			</RootProvider>
		</>
	);
}
