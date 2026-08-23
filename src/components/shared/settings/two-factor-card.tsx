import { Icon } from "@iconify/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { listAccounts, twoFactor, useSession } from "@/lib/auth/client";

const TOTP_LENGTH = 6;

// The password-backed steps ("enable" and "regenerate") reuse the same password prompt.
type Prompt = "none" | "enable" | "disable" | "regenerate";

function BackupCodes({ codes }: { codes: string[] }) {
  const { t } = useTranslation();

  function handleCopy() {
    navigator.clipboard.writeText(codes.join("\n"));

    toast.success(t("settings:twoFactor.backupCodes.copied"));
  }

  function handleDownload() {
    const url = URL.createObjectURL(new Blob([codes.join("\n")], { type: "text/plain" }));
    const link = document.createElement("a");

    link.href = url;
    link.download = "trackgeek-backup-codes.txt";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border p-4">
      <p className="text-sm font-medium">{t("settings:twoFactor.backupCodes.title")}</p>

      <p className="text-xs text-muted-foreground">{t("settings:twoFactor.backupCodes.warning")}</p>

      <div className="grid grid-cols-2 gap-2 font-mono text-sm">
        {codes.map((code) => (
          <span key={code}>{code}</span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
          <Icon icon={"lucide:copy"} className="size-4" />

          {t("settings:twoFactor.backupCodes.copy")}
        </Button>

        <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
          <Icon icon={"lucide:download"} className="size-4" />

          {t("settings:twoFactor.backupCodes.download")}
        </Button>
      </div>
    </div>
  );
}

export function TwoFactorCard() {
  const { t } = useTranslation();

  const session = useSession();

  const [prompt, setPrompt] = useState<Prompt>("none");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  const isEnabled = session.data?.user?.twoFactorEnabled === true;

  // Every two factor endpoint requires the account password, which OAuth-only users never set.
  const accountsQuery = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const data = await listAccounts();

      if (data.error) throw new Error(data.error.message);

      return data.data;
    },
  });

  const hasPassword = accountsQuery.data?.some((account) => account.providerId === "credential") ?? false;

  function reset() {
    setPrompt("none");
    setPassword("");
    setCode("");
    setTotpUri(null);
    setBackupCodes(null);
  }

  function showError(error: { code?: string; message?: string } | null, fallbackKey: string) {
    toast.error(error?.code ? t(`api:betterAuth.${error.code}`, { defaultValue: t(fallbackKey) }) : t(fallbackKey));
  }

  const enableMutation = useMutation({
    mutationFn: async () => {
      const data = await twoFactor.enable({ password });

      if (data.error) throw data.error;

      return data.data;
    },
    onSuccess: (data) => {
      setPassword("");
      setTotpUri(data.totpURI);
      setBackupCodes(data.backupCodes);
    },
    onError: (error) => showError(error, "settings:twoFactor.enable.error"),
  });

  const verifyMutation = useMutation({
    mutationFn: async (value: string) => {
      const data = await twoFactor.verifyTotp({ code: value });

      if (data.error) throw data.error;
    },
    onSuccess: async () => {
      await session.refetch();

      reset();

      toast.success(t("settings:twoFactor.enable.success"));
    },
    onError: (error) => {
      setCode("");

      showError(error, "api:betterAuth.INVALID_CODE");
    },
  });

  const disableMutation = useMutation({
    mutationFn: async () => {
      const data = await twoFactor.disable({ password });

      if (data.error) throw data.error;
    },
    onSuccess: async () => {
      await session.refetch();

      reset();

      toast.success(t("settings:twoFactor.disable.success"));
    },
    onError: (error) => showError(error, "settings:twoFactor.disable.error"),
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const data = await twoFactor.generateBackupCodes({ password });

      if (data.error) throw data.error;

      return data.data;
    },
    onSuccess: (data) => {
      setPassword("");
      setPrompt("none");
      setBackupCodes(data.backupCodes);

      toast.success(t("settings:twoFactor.regenerate.success"));
    },
    onError: (error) => showError(error, "settings:twoFactor.regenerate.error"),
  });

  const isPending =
    enableMutation.isPending || verifyMutation.isPending || disableMutation.isPending || regenerateMutation.isPending;

  function handleConfirmPassword() {
    if (prompt === "enable") return enableMutation.mutate();
    if (prompt === "disable") return disableMutation.mutate();
    if (prompt === "regenerate") return regenerateMutation.mutate();
  }

  return (
    <Card>
      <CardHeader className="gap-2">
        <CardTitle>
          <Icon icon={"lucide:shield-check"} className="size-5" />

          {t("settings:twoFactor.title")}

          {isEnabled && <Badge variant="secondary">{t("settings:twoFactor.active")}</Badge>}
        </CardTitle>

        <CardDescription>{t("settings:twoFactor.description")}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {!accountsQuery.isPending && !hasPassword && (
          <p className="text-sm text-muted-foreground">{t("settings:twoFactor.noPassword")}</p>
        )}

        {hasPassword && (
          <>
            {prompt !== "none" && !totpUri && (
              <div className="flex flex-col gap-3">
                <Field>
                  <FieldLabel htmlFor="twoFactorPassword">{t("common:password")}</FieldLabel>

                  <Input
                    id="twoFactorPassword"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    disabled={isPending}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </Field>

                <div className="flex gap-2">
                  <Button type="button" disabled={isPending || password.length === 0} onClick={handleConfirmPassword}>
                    {isPending ? <Icon className="size-5" icon="eos-icons:loading" /> : t("settings:twoFactor.confirm")}
                  </Button>

                  <Button type="button" variant="outline" disabled={isPending} onClick={reset}>
                    {t("common:cancel")}
                  </Button>
                </div>
              </div>
            )}

            {totpUri && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">{t("settings:twoFactor.scanInstructions")}</p>

                <div className="w-fit rounded-md bg-white p-3">
                  <QRCode value={totpUri} size={160} />
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">{t("settings:twoFactor.manualEntry")}</p>

                  <code className="text-xs break-all">{new URL(totpUri).searchParams.get("secret")}</code>
                </div>

                {backupCodes && <BackupCodes codes={backupCodes} />}

                <Field>
                  <FieldLabel>{t("settings:twoFactor.verifyLabel")}</FieldLabel>

                  <InputOTP
                    maxLength={TOTP_LENGTH}
                    disabled={isPending}
                    value={code}
                    onChange={(value) => {
                      setCode(value);

                      if (value.length === TOTP_LENGTH) verifyMutation.mutate(value);
                    }}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: TOTP_LENGTH }).map((_, index) => (
                        <InputOTPSlot key={index} index={index} className="size-11 text-base" />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </Field>

                <Button type="button" variant="outline" className="w-fit" disabled={isPending} onClick={reset}>
                  {t("common:cancel")}
                </Button>
              </div>
            )}

            {prompt === "none" && !totpUri && (
              <>
                {backupCodes && <BackupCodes codes={backupCodes} />}

                <div className="flex flex-wrap gap-2">
                  {isEnabled ? (
                    <>
                      <Button type="button" variant="outline" onClick={() => setPrompt("regenerate")}>
                        <Icon icon={"lucide:refresh-cw"} className="size-4" />

                        {t("settings:twoFactor.regenerate.button")}
                      </Button>

                      <Button type="button" variant="destructive" onClick={() => setPrompt("disable")}>
                        <Icon icon={"lucide:shield-off"} className="size-4" />

                        {t("settings:twoFactor.disable.button")}
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={() => setPrompt("enable")}>
                      <Icon icon={"lucide:shield-plus"} className="size-4" />

                      {t("settings:twoFactor.enable.button")}
                    </Button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
