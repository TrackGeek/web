import { createAuthClient } from "better-auth/react";
import {
	lastLoginMethodClient,
	magicLinkClient,
	inferAdditionalFields,
	customSessionClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_API_URL,
	basePath: "/auth",
	plugins: [
		customSessionClient(),
		lastLoginMethodClient(),
		magicLinkClient(),
		inferAdditionalFields({
			user: {
				image: { type: "string", required: false },
				username: { type: "string" },
				profile: {
					type: "json",
				},
			},
		}),
	],
});

export const { useSession, signIn, signOut, getLastUsedLoginMethod } =
	authClient;

export type Session = typeof authClient.$Infer.Session;

export type User = Omit<typeof authClient.$Infer.Session.user, "image"> & {
	username: string;
	profile: {
		avatarUrl?: string | null;
	};
};
