import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { HowLongToBeatData } from "@/types/how-long-to-beat";
import { formatHltbHours, roundToHalfHour } from "@/utils/format-hltb-hours";

interface HowLongToBeatPanelProps {
  data?: HowLongToBeatData | null;
}

export function HowLongToBeatPanel({ data }: HowLongToBeatPanelProps) {
  const { t, i18n } = useTranslation();
  if (!data) return null;
  const rows = [
    { key: "feed:completionStatus.mainStory", hours: data.mainStory },
    { key: "feed:completionStatus.mainStoryPlusExtras", hours: data.mainStoryWithExtras },
    { key: "missions:names.complete_50_games", hours: data.completionist },
  ];

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>
          <a href={`https://howlongtobeat.com/game/${data.hltbId}`} target="_blank" rel="noopener noreferrer">
            HowLongToBeat
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3">
          {rows.map(({ key, hours }) =>
            hours != null && hours > 0 ? (
              <div key={key} className="flex items-center justify-between gap-3 text-sm">
                <dt className="text-muted-foreground">{t(key)}</dt>
                <dd className="font-medium tabular-nums">
                  {t("common:hourCount", {
                    count: roundToHalfHour(hours),
                    formattedCount: formatHltbHours(hours, i18n.language),
                  })}
                </dd>
              </div>
            ) : null,
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
