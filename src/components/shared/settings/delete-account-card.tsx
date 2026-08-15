import { Icon } from "@iconify/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { deleteUser, useSession } from "@/lib/auth/client";

export function DeleteAccountCard() {
  const { t } = useTranslation();

  const session = useSession();

  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const email = session.data?.user?.email ?? "";
  const username = session.data?.user?.username ?? "";

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const data = await deleteUser({ callbackURL: `${window.location.origin}/account-deleted` });

      if (data.error) throw data.error;
    },
    onSuccess: () => {
      setOpen(false);
      setConfirmation("");

      toast.success(t("settings:deleteAccount.success"));
    },
    onError: (error: { code?: string; message?: string } | null) => {
      toast.error(
        error?.code
          ? t(`api:betterAuth.${error.code}`, { defaultValue: t("settings:deleteAccount.error") })
          : t("settings:deleteAccount.error"),
      );
    },
  });

  function handleOpenChange(next: boolean) {
    if (deleteAccountMutation.isPending) return;

    if (!next) setConfirmation("");

    setOpen(next);
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader className="gap-2">
        <CardTitle>
          <Icon icon={"lucide:trash-2"} className="size-5 text-destructive" />

          {t("settings:deleteAccount.title")}
        </CardTitle>

        <CardDescription>{t("settings:deleteAccount.description")}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{t("settings:deleteAccount.warning")}</p>

        <Button type="button" variant="destructive" className="w-fit" onClick={() => setOpen(true)}>
          <Icon icon={"lucide:trash-2"} className="size-4" />

          {t("settings:deleteAccount.button")}
        </Button>
      </CardContent>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon icon={"lucide:triangle-alert"} className="size-5 text-destructive" />

              {t("settings:deleteAccount.dialog.title")}
            </DialogTitle>

            <DialogDescription>
              <Trans i18nKey="settings:deleteAccount.dialog.description" values={{ email }} />
            </DialogDescription>
          </DialogHeader>

          <Field>
            <FieldLabel htmlFor="deleteAccountConfirmation">
              <Trans i18nKey="settings:deleteAccount.dialog.confirmLabel" values={{ username }} />
            </FieldLabel>

            <Input
              id="deleteAccountConfirmation"
              autoComplete="off"
              placeholder={username}
              disabled={deleteAccountMutation.isPending}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleteAccountMutation.isPending}
              onClick={() => handleOpenChange(false)}
            >
              {t("common:cancel")}
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={deleteAccountMutation.isPending || confirmation !== username || username.length === 0}
              onClick={() => deleteAccountMutation.mutate()}
            >
              {deleteAccountMutation.isPending ? (
                <Icon className="size-5" icon="eos-icons:loading" />
              ) : (
                <>
                  <Icon icon={"lucide:mail"} className="size-4" />

                  {t("settings:deleteAccount.dialog.confirm")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
