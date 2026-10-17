import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AuthorizedOAuthApp } from "@/types/oauth";

export function useOAuthApps() {
  const queries = useQueryClient();
  const apps = useQuery({
    queryKey: ["oauth-authorized-apps"],
    queryFn: async () => (await api.get<{ apps: AuthorizedOAuthApp[] }>("/integrations/apps")).data.apps,
  });
  const revoke = useMutation({
    mutationFn: (clientId: string) => api.delete(`/integrations/apps/${encodeURIComponent(clientId)}`),
    onSuccess: () => queries.invalidateQueries({ queryKey: ["oauth-authorized-apps"] }),
  });
  return { apps, revoke };
}
