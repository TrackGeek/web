import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { linkSocial, listAccounts, unlinkAccount, useSession } from "@/lib/auth/client";
import { authProviders } from "@/lib/auth/providers";

export function ConnectionsCard() {
  const { t } = useTranslation();

  const session = useSession();
  const queryClient = useQueryClient();

  // Shares the cache entry with TwoFactorCard, which reads the same list to detect a password account.
  const accountsQuery = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const data = await listAccounts();

      if (data.error) throw new Error(data.error.message);

      return data.data;
    },
  });

  const connected = new Map(
    (accountsQuery.data ?? []).filter((account) => account.providerId !== "credential").map((a) => [a.providerId, a]),
  );

  // The "credential" row counts as a login method too, so it protects an OAuth-only unlink as well.
  const loginMethodCount = accountsQuery.data?.length ?? 0;

  function showError(error: { code?: string; message?: string } | null, fallbackKey: string) {
    toast.error(error?.code ? t(`api:betterAuth.${error.code}`, { defaultValue: t(fallbackKey) }) : t(fallbackKey));
  }

  const linkMutation = useMutation({
    mutationFn: async (provider: string) => {
      const data = await linkSocial({ provider, callbackURL: window.location.href });

      if (data.error) throw data.error;
    },
    onError: (error) => showError(error, "settings:connections.link.error"),
  });

  const unlinkMutation = useMutation({
    mutationFn: async ({ providerId, accountId }: { providerId: string; accountId: string }) => {
      const data = await unlinkAccount({ providerId, accountId });

      if (data.error) throw data.error;
    },
    onSuccess: async () => {
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["accounts"] }), session.refetch()]);

      toast.success(t("settings:connections.unlink.success"));
    },
    onError: (error) => showError(error, "settings:connections.unlink.error"),
  });

  const isPending = accountsQuery.isPending || linkMutation.isPending || unlinkMutation.isPending;

  return (
    <Card>
      <CardHeader className="gap-2">
        <CardTitle>
          <Icon icon={"lucide:link"} className="size-5" />

          {t("settings:connections.title")}
        </CardTitle>

        <CardDescription>{t("settings:connections.description")}</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {authProviders.map((provider) => {
          const account = connected.get(provider.id);
          const isLastMethod = loginMethodCount <= 1;

          return (
            <div key={provider.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
              <div className="flex items-center gap-3">
                {provider.icon}

                <span className="text-sm font-medium">{t(`auth:providers.${provider.id}`)}</span>
              </div>

              {account ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{t("settings:connections.connected")}</Badge>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      {/* The span keeps the tooltip reachable while the button is disabled. */}
                      <span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isPending || isLastMethod}
                          onClick={() =>
                            unlinkMutation.mutate({ providerId: provider.id, accountId: account.accountId })
                          }
                        >
                          <Icon icon={"lucide:unlink"} className="size-4" />
                        </Button>
                      </span>
                    </TooltipTrigger>

                    <TooltipContent side="bottom">
                      {isLastMethod ? t("settings:connections.lastMethod") : t("settings:connections.disconnect")}
                    </TooltipContent>
                  </Tooltip>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => linkMutation.mutate(provider.id)}
                >
                  <Icon icon={"lucide:link"} className="size-4" />

                  {t("settings:connections.connect")}
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
