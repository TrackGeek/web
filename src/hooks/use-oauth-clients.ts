import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import type { NewOAuthClient, OAuthClientCredentials } from "@/types/oauth";

export function useOAuthClients() {
  const queries = useQueryClient();
  const [credentials, setCredentials] = useState<OAuthClientCredentials | null>(null);
  const clients = useQuery({
    queryKey: ["oauth-developer-clients"],
    queryFn: async () => {
      const result = await authClient.oauth2.getClients();
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
  });
  const create = useMutation({
    mutationFn: async (input: NewOAuthClient) => {
      const result = await authClient.oauth2.createClient({
        client_name: input.name,
        redirect_uris: input.redirectUris,
        token_endpoint_auth_method: input.confidential ? "client_secret_basic" : "none",
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        scope: input.scopes.join(" "),
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: async (data) => {
      if (data) setCredentials({ client_id: data.client_id, client_secret: data.client_secret });
      await queries.invalidateQueries({ queryKey: ["oauth-developer-clients"] });
    },
  });
  const remove = useMutation({
    mutationFn: async (clientId: string) => {
      const result = await authClient.oauth2.deleteClient({ client_id: clientId });
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: () => queries.invalidateQueries({ queryKey: ["oauth-developer-clients"] }),
  });
  return { clients, create, remove, credentials, clearCredentials: () => setCredentials(null) };
}
