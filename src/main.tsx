import "./lib/i18n/config.ts";
import "./global.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
	createBrowserRouter,
	Navigate,
	RouterProvider,
  type RouteObject,
} from "react-router-dom";

import { BookDetails } from "./pages/book-details.tsx";
import { HomePage } from "./pages/home";
import { RootProvider } from "./providers/root-provider.tsx";
import { GameDetails } from "./pages/game-details.tsx";
import { UserDetailsPage } from './pages/user-details.tsx';
import { SettingsPage } from './pages/settings.tsx';
import { useAuth } from './hooks/use-auth.tsx';

export function Routes() {
  const { isAuthenticated } = useAuth();
  
	const protectRoutes: RouteObject[] = [
    {
      path: "/settings",
      element: <SettingsPage />,
    }
  ];

	const publicRoutes: RouteObject[] = [
    {
			path: "/",
			element: <HomePage />,
		},
		{
			path: "/book/:bookSlug",
			element: <BookDetails />,
		},
		{
			path: "/game/:bookSlug",
			element: <GameDetails />,
    },
    {
			path: "/user/:username",
			element: <UserDetailsPage />,
		},
	];

	const router = createBrowserRouter([
		...publicRoutes,
		...(isAuthenticated ? protectRoutes : []),
		{
			path: "*",
			element: <Navigate to="/" />,
		},
	]);

	return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<RootProvider>
			<Routes />
		</RootProvider>
	</StrictMode>,
);
