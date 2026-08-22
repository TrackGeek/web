import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { TFunction } from "i18next";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { changePassword, listAccounts, requestPasswordReset, useSession } from "@/lib/auth/client";

const MIN_PASSWORD_LENGTH = 8;

function createChangePasswordSchema(t: TFunction) {
  return z
    .object({
      currentPassword: z.string().min(MIN_PASSWORD_LENGTH, t("settings:password.errors.min")),
      newPassword: z.string().min(MIN_PASSWORD_LENGTH, t("settings:password.errors.min")),
      confirmPassword: z.string().min(MIN_PASSWORD_LENGTH, t("settings:password.errors.min")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("settings:password.errors.mismatch"),
      path: ["confirmPassword"],
    })
    .refine((data) => data.newPassword !== data.currentPassword, {
      message: t("settings:password.errors.same"),
      path: ["newPassword"],
    });
}

type ChangePasswordFormData = z.infer<ReturnType<typeof createChangePasswordSchema>>;

export function PasswordCard() {
  const { t } = useTranslation();

  const session = useSession();

  // Shares the cache entry with ConnectionsCard and TwoFactorCard, which read the same list.
  const accountsQuery = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const data = await listAccounts();

      if (data.error) throw new Error(data.error.message);

      return data.data;
    },
  });

  const hasPassword = accountsQuery.data?.some((account) => account.providerId === "credential") ?? false;

  const changePasswordSchema = useMemo(() => createChangePasswordSchema(t), [t]);

  const changePasswordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
  });

  function showError(error: { code?: string; message?: string } | null, fallbackKey: string) {
    toast.error(error?.code ? t(`api:betterAuth.${error.code}`, { defaultValue: t(fallbackKey) }) : t(fallbackKey));
  }

  // better-auth's setPassword has no HTTP route, so a first password goes through the reset email.
  const setPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const data = await requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (data.error) throw data.error;
    },
    onSuccess: () => toast.success(t("settings:password.set.success")),
    onError: (error) => showError(error, "settings:password.set.error"),
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (formData: ChangePasswordFormData) => {
      const data = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        revokeOtherSessions: true,
      });

      if (data.error) throw data.error;
    },
    onSuccess: async () => {
      // Revoking the other sessions rotates this one's token, so the cached session goes stale.
      await session.refetch();

      changePasswordForm.reset();

      toast.success(t("settings:password.change.success"));
    },
    onError: (error) => showError(error, "settings:password.change.error"),
  });

  const email = session.data?.user?.email;

  return (
    <Card>
      <CardHeader className="gap-2">
        <CardTitle>
          <Icon icon={"lucide:key-round"} className="size-5" />

          {t("common:password")}
        </CardTitle>

        <CardDescription>{t("settings:password.description")}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {!accountsQuery.isPending && !hasPassword && (
          <>
            <p className="text-sm text-muted-foreground">{t("settings:password.noPassword")}</p>

            <Button
              type="button"
              className="w-fit"
              disabled={setPasswordMutation.isPending || !email}
              onClick={() => email && setPasswordMutation.mutate(email)}
            >
              {setPasswordMutation.isPending ? (
                <Icon className="size-5" icon="eos-icons:loading" />
              ) : (
                <>
                  <Icon icon={"lucide:mail"} className="size-4" />

                  {t("settings:password.set.button")}
                </>
              )}
            </Button>
          </>
        )}

        {hasPassword && (
          <form
            className="flex flex-col gap-4"
            onSubmit={changePasswordForm.handleSubmit((formData) => changePasswordMutation.mutate(formData))}
          >
            <Field>
              <FieldLabel htmlFor="currentPassword">{t("settings:password.current")}</FieldLabel>

              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={changePasswordMutation.isPending}
                {...changePasswordForm.register("currentPassword")}
              />

              {changePasswordForm.formState.errors.currentPassword?.message && (
                <FieldError>{changePasswordForm.formState.errors.currentPassword?.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="newPassword">{t("settings:password.new")}</FieldLabel>

              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={changePasswordMutation.isPending}
                {...changePasswordForm.register("newPassword")}
              />

              {changePasswordForm.formState.errors.newPassword?.message && (
                <FieldError>{changePasswordForm.formState.errors.newPassword?.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">{t("settings:password.confirm")}</FieldLabel>

              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={changePasswordMutation.isPending}
                {...changePasswordForm.register("confirmPassword")}
              />

              {changePasswordForm.formState.errors.confirmPassword?.message && (
                <FieldError>{changePasswordForm.formState.errors.confirmPassword?.message}</FieldError>
              )}
            </Field>

            <Button type="submit" className="w-fit" disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending ? (
                <Icon className="size-5" icon="eos-icons:loading" />
              ) : (
                <>
                  <Icon icon={"lucide:key-round"} className="size-4" />

                  {t("settings:password.change.button")}
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
