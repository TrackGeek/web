import "./lib/i18n/config.ts";
import "./global.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { HomePage } from "./pages/home";
import { LoginPage } from "./pages/login";
import { RootProvider } from './providers/root-provider.tsx';

export function Routes() {
	const protectRoutes = [
		{
			path: "/",
			element: <HomePage />,
		},
	];

	const publicRoutes = [
		{
			path: "/login",
			element: <LoginPage />,
		},
	];

	const router = createBrowserRouter([
		...protectRoutes,
		...publicRoutes,
		{
			path: "*",
			element: <Navigate to="/" replace />,
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
