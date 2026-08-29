import { passkeyClient } from "@better-auth/passkey/client";
import {
  customSessionClient,
  inferAdditionalFields,
  lastLoginMethodClient,
  magicLinkClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { openAuthModalTwoFactor } from "@/lib/auth/modal";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  basePath: "/auth",
  plugins: [
    usernameClient(),
    customSessionClient(),
    lastLoginMethodClient(),
    magicLinkClient(),
    passkeyClient(),
    twoFactorClient({
      // Every login method funnels into the same modal step instead of a dedicated page.
      onTwoFactorRedirect() {
        openAuthModalTwoFactor();
      },
    }),
    inferAdditionalFields({
      user: {
        tier: {
          type: "string",
          required: false,
        },
        twoFactorEnabled: {
          type: "boolean",
          required: false,
        },
        tierStartedAt: {
          type: "string",
          required: false,
        },
        role: {
          type: "string",
          required: false,
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
  changePassword,
  useSession,
  signIn,
  signUp,
  signOut,
  getLastUsedLoginMethod,
  resetPassword,
  twoFactor,
  passkey,
  listAccounts,
  linkSocial,
  unlinkAccount,
  deleteUser,
} = authClient;

export function isTwoFactorRedirect(data: unknown): boolean {
  return typeof data === "object" && data !== null && "twoFactorRedirect" in data && data.twoFactorRedirect === true;
}

export type Session = typeof authClient.$Infer.Session;

export type User = Omit<typeof authClient.$Infer.Session.user, "image"> & {
  profile: {
    avatarUrl?: string | null;
  };
};
