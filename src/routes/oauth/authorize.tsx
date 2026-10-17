import { createFileRoute } from "@tanstack/react-router";
import { OAuthConsentCard } from "@/components/oauth/oauth-consent-card";
import { OAuthRequestState } from "@/components/oauth/oauth-request-state";
import { OAuthSignInCard } from "@/components/oauth/oauth-sign-in-card";
import { useOAuthAuthorization } from "@/hooks/use-oauth-authorization";

export const Route = createFileRoute("/oauth/authorize")({
  ssr: false,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: OAuthAuthorizationRoute,
});

function OAuthAuthorizationRoute() {
  const { session, client, scopes, valid, consent } = useOAuthAuthorization();
  return (
    <div className="mx-auto my-8 w-full max-w-lg">
      {!valid || client.isError ? (
        <OAuthRequestState error />
      ) : session.isPending ? (
        <OAuthRequestState />
      ) : !session.data?.user ? (
        <OAuthSignInCard />
      ) : client.isPending ? (
        <OAuthRequestState />
      ) : (
        <OAuthConsentCard
          name={client.data?.client_name ?? client.data?.client_id ?? "TrackGeek"}
          account={session.data.user.name}
          scopes={scopes}
          pending={consent.isPending}
          error={consent.isError}
          onConsent={(accept) => consent.mutate(accept)}
        />
      )}
    </div>
  );
}
