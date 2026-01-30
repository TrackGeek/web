import "./lib/i18n/config.ts";
import "./global.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
	createBrowserRouter,
	Navigate,
	type RouteObject,
	RouterProvider,
} from "react-router-dom";
import { useAuth } from "./hooks/use-auth.tsx";
import { BookDetails } from "./pages/book-details.tsx";
import { GameDetails } from "./pages/game-details.tsx";
import { HomePage } from "./pages/home";
import { SettingsPage } from "./pages/settings.tsx";
import { UserDetailsPage } from "./pages/user-details.tsx";
import { RootProvider } from "./providers/root-provider.tsx";
import { MovieDetails } from "./pages/movie-details.tsx";
import { TVShowDetails } from "./pages/tv-show-details.tsx";
import { AnimeDetails } from "./pages/anime-details.tsx";

export function Routes() {
	const { isAuthenticated } = useAuth();

	const protectRoutes: RouteObject[] = [
		{
			path: "/settings",
			element: <SettingsPage />,
		},
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
			path: "/movie/:bookSlug",
			element: <MovieDetails />,
		},
		{
			path: "/tv/:bookSlug",
			element: <TVShowDetails />,
		},
		{
			path: "/anime/:bookSlug",
			element: <AnimeDetails />,
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
