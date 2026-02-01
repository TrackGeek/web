import "./lib/i18n/config.ts";
import "./global.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import {
	createBrowserRouter,
	Navigate,
	type RouteObject,
	RouterProvider,
} from "react-router-dom";
import { useAuth } from "./hooks/use-auth.tsx";
import { AnimeDetails } from "./pages/anime-details.tsx";
import { BookDetails } from "./pages/book-details.tsx";
import { GameDetails } from "./pages/game-details.tsx";
import { HomePage } from "./pages/home";
import { MangaDetails } from "./pages/manga-details.tsx";
import { MovieDetails } from "./pages/movie-details.tsx";
import { SettingsPage } from "./pages/settings.tsx";
import { TVShowDetails } from "./pages/tv-show-details.tsx";
import { UserDetailsPage } from "./pages/user-details.tsx";
import { RootProvider } from "./providers/root-provider.tsx";

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
			path: "/movie/:movieSlug",
			element: <MovieDetails />,
		},
		{
			path: "/tv/:tvShowSlug",
			element: <TVShowDetails />,
		},
		{
			path: "/anime/:animeSlug",
			element: <AnimeDetails />,
		},
		{
			path: "/manga/:mangaSlug",
			element: <MangaDetails />,
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
		<HelmetProvider>
			<RootProvider>
				<Routes />
			</RootProvider>
		</HelmetProvider>
	</StrictMode>,
);
