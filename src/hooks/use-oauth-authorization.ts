import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { authClient, useSession } from "@/lib/auth/client";
import { setAuthModalOpen } from "@/lib/auth/modal";

export function useOAuthAuthorization() {
  const session = useSession();
  const [params] = useState(() => new URLSearchParams(typeof window === "undefined" ? "" : window.location.search));
  const clientId = params.get("client_id");
  const scopes = [...new Set((params.get("scope") ?? "").split(" ").filter(Boolean))];
  const valid = Boolean(clientId && params.get("sig") && params.get("code_challenge"));
  const client = useQuery({
    queryKey: ["oauth-client-public", clientId],
    enabled: valid && Boolean(session.data?.user),
    retry: false,
    queryFn: async () => {
      if (!clientId) throw new Error("Missing OAuth client ID");
      const result = await authClient.oauth2.publicClient({ query: { client_id: clientId } });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
  });
  const consent = useMutation({
    mutationFn: async (accept: boolean) => {
      const result = await authClient.oauth2.consent({ accept, oauth_query: params.toString() });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
  });

  useEffect(() => {
    if (session.data?.user) setAuthModalOpen(false);
  }, [session.data?.user]);

  return { session, client, scopes, valid, consent };
}
