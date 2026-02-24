import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { authClient } from "./lib/auth";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
	routeTree,
	context: {
		auth: authClient,
	},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
	const root = createRoot(rootElement);

	root.render(
		<StrictMode>
			<RouterProvider router={router} />
		</StrictMode>,
	);
}
