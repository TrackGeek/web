import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { passkey } from "@/lib/auth/client";

export function PasskeysCard() {
  const { t, i18n } = useTranslation();

  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && Boolean(window.PublicKeyCredential));
  }, []);

  const passkeysQuery = useQuery({
    queryKey: ["passkeys"],
    queryFn: async () => {
      const data = await passkey.listUserPasskeys();

      if (data.error) throw new Error(data.error.message);

      return data.data;
    },
    enabled: isSupported,
  });

  function showError(error: { code?: string; message?: string } | null, fallbackKey: string) {
    toast.error(error?.code ? t(`api:betterAuth.${error.code}`, { defaultValue: t(fallbackKey) }) : t(fallbackKey));
  }

  const addMutation = useMutation({
    mutationFn: async () => {
      const data = await passkey.addPasskey({ name: name.trim() || undefined });

      if (data?.error) throw data.error;
    },
    onSuccess: async () => {
      setName("");

      await queryClient.invalidateQueries({ queryKey: ["passkeys"] });

      toast.success(t("settings:passkeys.add.success"));
    },
    onError: (error) => {
      if (error && "code" in error && error.code === "REGISTRATION_CANCELLED") return;

      showError(error, "settings:passkeys.add.error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const data = await passkey.deletePasskey({ id });

      if (data.error) throw data.error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["passkeys"] });

      toast.success(t("settings:passkeys.delete.success"));
    },
    onError: (error) => showError(error, "settings:passkeys.delete.error"),
  });

  const passkeys = passkeysQuery.data ?? [];

  return (
    <Card>
      <CardHeader className="gap-2">
        <CardTitle>
          <Icon icon={"lucide:fingerprint"} className="size-5" />

          {t("settings:passkeys.title")}
        </CardTitle>

        <CardDescription>{t("settings:passkeys.description")}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {!isSupported && <p className="text-sm text-muted-foreground">{t("settings:passkeys.unsupported")}</p>}

        {isSupported && (
          <>
            {!passkeysQuery.isPending && passkeys.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("settings:passkeys.empty")}</p>
            )}

            {passkeys.length > 0 && (
              <ul className="flex flex-col gap-2">
                {passkeys.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.name || t("settings:passkeys.unnamed")}</span>

                      {item.createdAt && (
                        <span className="text-xs text-muted-foreground">
                          {t("settings:passkeys.addedAt", {
                            date: new Date(item.createdAt).toLocaleDateString(i18n.language),
                          })}
                        </span>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                      <Icon icon={"lucide:trash-2"} className="size-4" />

                      {t("settings:passkeys.delete.button")}
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <Field>
              <FieldLabel htmlFor="passkeyName">{t("settings:passkeys.nameLabel")}</FieldLabel>

              <Input
                id="passkeyName"
                type="text"
                placeholder={t("settings:passkeys.namePlaceholder")}
                disabled={addMutation.isPending}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>

            <Button
              type="button"
              className="w-fit"
              disabled={addMutation.isPending}
              onClick={() => addMutation.mutate()}
            >
              {addMutation.isPending ? (
                <Icon className="size-5" icon="eos-icons:loading" />
              ) : (
                <>
                  <Icon icon={"lucide:plus"} className="size-4" />

                  {t("settings:passkeys.add.button")}
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
