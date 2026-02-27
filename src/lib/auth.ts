import { createAuthClient } from "better-auth/react";
import {
	lastLoginMethodClient,
	magicLinkClient,
	inferAdditionalFields,
	customSessionClient,
  usernameClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_API_URL,
	basePath: "/auth",
	plugins: [
    usernameClient(),
		customSessionClient(),
		lastLoginMethodClient(),
		magicLinkClient(),
		inferAdditionalFields({
			user: {
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
	profile: {
		avatarUrl?: string | null;
	};
};
