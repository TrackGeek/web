import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { Image } from "@unpic/react";
import type { TFunction } from "i18next";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLinkPsnAccount, usePsnAccount, useUnlinkPsnAccount } from "@/hooks/psn";
import { cn } from "@/lib/utils";
import { apiErrorMessage } from "@/lib/utils/api-error";

const NPSSO_LENGTH = 64;
const PLAYSTATION_URL = "https://www.playstation.com";
const NPSSO_URL = "https://ca.account.sony.com/api/v1/ssocookie";

const EXTERNAL_LINK_CLASS = "font-medium text-primary underline-offset-4 hover:underline";

function createPsnSchema(t: TFunction) {
  return z.object({
    npsso: z
      .string()
      .trim()
      .length(NPSSO_LENGTH, t("settings:psn.npssoInvalid", { count: NPSSO_LENGTH })),
  });
}

type PsnFormData = z.infer<ReturnType<typeof createPsnSchema>>;

export function PsnConnectionCard() {
  const { t } = useTranslation();

  const accountQuery = usePsnAccount();
  const linkAccount = useLinkPsnAccount();
  const unlinkAccount = useUnlinkPsnAccount();

  const account = accountQuery.data;

  const schema = useMemo(() => createPsnSchema(t), [t]);

  const form = useForm<PsnFormData>({
    resolver: zodResolver(schema),
    defaultValues: { npsso: "" },
  });

  const handleSubmit = form.handleSubmit(async ({ npsso }) => {
    try {
      await linkAccount.mutateAsync({ npsso });

      form.reset();

      toast.success(t("settings:psn.linked"));
    } catch (error) {
      toast.error(apiErrorMessage(t, error));
    }
  });

  async function handleUnlink() {
    try {
      await unlinkAccount.mutateAsync();

      toast.success(t("settings:connections.unlink.success"));
    } catch (error) {
      toast.error(apiErrorMessage(t, error));
    }
  }

  const showForm = !account || account.expired;

  return (
    <Card>
      <CardHeader className="gap-2">
        <CardTitle>
          <Icon icon="simple-icons:playstation" className="size-5" />

          {t("settings:psn.title")}
        </CardTitle>

        <CardDescription>{t("settings:psn.description")}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {accountQuery.isPending ? (
          <Skeleton className="h-14 w-full" />
        ) : (
          <>
            {account && (
              <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div className="flex min-w-0 items-center gap-3">
                  {account.avatarUrl ? (
                    <Image
                      src={account.avatarUrl}
                      width={32}
                      height={32}
                      alt={account.onlineId}
                      className="size-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <Icon icon="simple-icons:playstation" className="size-5 shrink-0" />
                  )}

                  <span className="truncate text-sm font-medium">{account.onlineId}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={account.expired ? "warning" : "secondary"}>
                    {account.expired ? t("settings:psn.expired") : t("settings:connections.connected")}
                  </Badge>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={unlinkAccount.isPending}
                        aria-label={t("settings:connections.disconnect")}
                        onClick={handleUnlink}
                      >
                        <Icon icon="lucide:unlink" className="size-4" />
                      </Button>
                    </TooltipTrigger>

                    <TooltipContent side="bottom">{t("settings:connections.disconnect")}</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}

            {showForm && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>
                    <Trans
                      i18nKey="settings:psn.steps.signIn"
                      components={{
                        link: (
                          // biome-ignore lint/a11y/useAnchorContent: Trans injects the anchor text
                          <a href={PLAYSTATION_URL} target="_blank" rel="noreferrer" className={EXTERNAL_LINK_CLASS} />
                        ),
                      }}
                    />
                  </li>

                  <li>
                    <Trans
                      i18nKey="settings:psn.steps.openCookie"
                      values={{ url: NPSSO_URL }}
                      components={{
                        link: (
                          // biome-ignore lint/a11y/useAnchorContent: Trans injects the anchor text
                          <a
                            href={NPSSO_URL}
                            target="_blank"
                            rel="noreferrer"
                            className={cn(EXTERNAL_LINK_CLASS, "break-all font-mono text-xs")}
                          />
                        ),
                      }}
                    />
                  </li>

                  <li>{t("settings:psn.steps.copy")}</li>
                </ol>

                <Field>
                  <FieldLabel htmlFor="psn-npsso">{t("settings:psn.npssoLabel")}</FieldLabel>

                  <Input
                    id="psn-npsso"
                    type="password"
                    autoComplete="off"
                    spellCheck={false}
                    className="font-mono text-xs"
                    aria-invalid={!!form.formState.errors.npsso}
                    {...form.register("npsso")}
                  />

                  <FieldDescription>{t("settings:psn.securityNote")}</FieldDescription>

                  {form.formState.errors.npsso?.message && (
                    <FieldError>{form.formState.errors.npsso.message}</FieldError>
                  )}
                </Field>

                <Button type="submit" size="sm" className="self-end" disabled={linkAccount.isPending}>
                  <Icon icon={linkAccount.isPending ? "eos-icons:loading" : "lucide:link"} className="size-4" />

                  {account?.expired ? t("settings:psn.reconnect") : t("settings:connections.connect")}
                </Button>
              </form>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
