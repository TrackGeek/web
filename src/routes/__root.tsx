import "@/lib/i18n/config.ts";
import "@/global.css";

import { createRootRouteWithContext, HeadContent, Outlet } from "@tanstack/react-router";

import { RootProvider } from "@/providers";
import { MainLayout } from "@/components/layouts/main";
import type { authClient } from "@/lib/auth";

interface RouterContext {
	auth: typeof authClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootLayout,
});

function RootLayout() {
	return (
		<>
      <HeadContent />
    
      <RootProvider>
        <MainLayout>
          
          <Outlet />
        </MainLayout>
      </RootProvider>
    </>
	);
}
