import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const REASONS = [
  "user:presenceInfoNotLinked",
  "user:presenceInfoNotInGuild",
  "user:presenceInfoOffline",
  "user:presenceInfoNotPublic",
] as const;

export function PresenceInfoTooltip() {
  const { t } = useTranslation();

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
            {REASONS.map((reason) => (
              <li key={reason}>{t(reason)}</li>
            ))}
          </ul>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
