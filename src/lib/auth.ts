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
        tier: {
          type: "string",
          required: false,
        },
        tierStartedAt: {
          type: "string",
          required: false,
        },
        role: {
          type: "string",
          required: true,
        },
        profile: {
          type: "json",
          required: false,
        },
      },
    }),
  ],
});

export const {
  sendVerificationEmail,
  requestPasswordReset,
  useSession,
  signIn,
  signUp,
  signOut,
  getLastUsedLoginMethod,
  resetPassword,
} = authClient;

export type Session = typeof authClient.$Infer.Session;

export type User = Omit<typeof authClient.$Infer.Session.user, "image"> & {
  profile: {
    avatarUrl?: string | null;
  };
};
