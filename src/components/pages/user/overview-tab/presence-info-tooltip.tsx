import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const REASONS_BY_PROVIDER = {
  discord: [
    "user:presenceInfoNotLinked",
    "user:presenceInfoNotInGuild",
    "user:presenceInfoOffline",
    "user:presenceInfoNotPublic",
  ],
  spotify: ["user:presenceInfoNotLinked", "user:presenceInfoOffline"],
} as const;

interface PresenceInfoTooltipProps {
  provider: keyof typeof REASONS_BY_PROVIDER;
}

export function PresenceInfoTooltip({ provider }: PresenceInfoTooltipProps) {
  const { t } = useTranslation();

  const providerName = t(`auth:providers.${provider}`);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={t("user:presenceInfoTitle")}
          className="cursor-pointer text-muted-foreground transition-colors hover:text-primary"
        >
          <Icon icon="lucide:info" className="size-4" />
        </button>
      </TooltipTrigger>

      <TooltipContent side="bottom" className="bg-muted">
        <div className="max-w-xs">
          <p className="font-semibold">{t("user:presenceInfoTitle")}</p>

          <ul className="mt-1 flex list-disc flex-col gap-0.5 pl-4 text-xs text-muted-foreground">
            {REASONS_BY_PROVIDER[provider].map((reason) => (
              <li key={reason}>{t(reason, { provider: providerName })}</li>
            ))}
          </ul>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
