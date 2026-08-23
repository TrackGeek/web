import { Icon } from "@iconify/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { twoFactor } from "@/lib/auth/client";

const TOTP_LENGTH = 6;

// Codes are generated as "xxxxx-xxxxx", so the separator counts towards the length.
const BACKUP_CODE_LENGTH = 11;

interface TwoFactorFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function TwoFactorForm({ onBack, onSuccess }: TwoFactorFormProps) {
  const { t } = useTranslation();

  const [useBackupCode, setUseBackupCode] = useState(false);
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleVerify(value: string) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    const data = useBackupCode
      ? await twoFactor.verifyBackupCode({ code: value, trustDevice })
      : await twoFactor.verifyTotp({ code: value, trustDevice });

    setIsSubmitting(false);

    if (data.error) {
      toast.error(
        data.error.code
          ? t(`api:betterAuth.${data.error.code}`, { defaultValue: t("api:betterAuth.INVALID_CODE") })
          : t("api:betterAuth.INVALID_CODE"),
      );

      setCode("");

      return;
    }

    toast.success(t("auth:loginSuccessful"));

    onSuccess();
  }

  function handleToggleBackupCode() {
    setUseBackupCode((previous) => !previous);
    setCode("");
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        handleVerify(code);
      }}
    >
      {useBackupCode ? (
        <Field>
          <FieldLabel htmlFor="backupCode">{t("auth:twoFactor.backupCodeLabel")}</FieldLabel>

          <Input
            id="backupCode"
            autoFocus
            autoComplete="one-time-code"
            placeholder="xxxxx-xxxxx"
            maxLength={BACKUP_CODE_LENGTH}
            disabled={isSubmitting}
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </Field>
      ) : (
        <div className="flex justify-center">
          <InputOTP
            autoFocus
            maxLength={TOTP_LENGTH}
            disabled={isSubmitting}
            value={code}
            onChange={(value) => {
              setCode(value);

              if (value.length === TOTP_LENGTH) handleVerify(value);
            }}
          >
            <InputOTPGroup>
              {Array.from({ length: TOTP_LENGTH }).map((_, index) => (
                <InputOTPSlot key={index} index={index} className="size-11 text-base" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
      )}

      <FieldLabel className="flex items-center gap-2 font-normal">
        <Checkbox
          checked={trustDevice}
          disabled={isSubmitting}
          onCheckedChange={(checked) => setTrustDevice(checked === true)}
        />

        <span className="text-sm">{t("auth:twoFactor.trustDevice")}</span>
      </FieldLabel>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || code.length < (useBackupCode ? 1 : TOTP_LENGTH)}
      >
        {isSubmitting ? (
          <Icon className="size-5" icon="eos-icons:loading" />
        ) : (
          <>
            <Icon icon={"lucide:shield-check"} className="size-5" />

            {t("auth:twoFactor.verify")}
          </>
        )}
      </Button>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="text-xs text-muted-foreground cursor-pointer"
          disabled={isSubmitting}
          onClick={onBack}
        >
          {t("auth:twoFactor.back")}
        </button>

        <button
          type="button"
          className="text-xs text-muted-foreground cursor-pointer"
          disabled={isSubmitting}
          onClick={handleToggleBackupCode}
        >
          {useBackupCode ? t("auth:twoFactor.useAuthenticatorCode") : t("auth:twoFactor.useBackupCode")}
        </button>
      </div>
    </form>
  );
}
