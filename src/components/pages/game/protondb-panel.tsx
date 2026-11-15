import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useIsLinux } from "@/hooks/use-is-linux";
import { cn } from "@/lib/utils";

const DECK_STATUS: Record<number, string> = { 0: "unknown", 1: "unsupported", 2: "playable", 3: "verified" };

const TIER_STYLES: Record<string, string> = {
  platinum: "border-transparent bg-slate-300 text-slate-950",
  gold: "border-transparent bg-amber-300 text-amber-950",
  silver: "border-transparent bg-zinc-300 text-zinc-950",
  bronze: "border-transparent bg-orange-300 text-orange-950",
  borked: "border-transparent bg-red-200 text-red-950",
  native: "border-transparent bg-emerald-200 text-emerald-950",
};

interface ProtonDbPanelProps {
  steamAppId: string | null;
  protonDbTier: string | null;
  protonDbScore: number | null;
  steamDeckCategory: number | null;
}

export function ProtonDbPanel({ steamAppId, protonDbTier, protonDbScore, steamDeckCategory }: ProtonDbPanelProps) {
  const { t, i18n } = useTranslation();
  const isLinux = useIsLinux();

  if (!isLinux || !steamAppId) return null;

  return (
    <Accordion type="single" collapsible defaultValue="protondb" className="border-t border-border">
      <AccordionItem value="protondb">
        <AccordionTrigger className="font-semibold">ProtonDB</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {!protonDbTier && steamDeckCategory === null ? (
            <p className="text-muted-foreground">{t("library:protonDb.noSummary")}</p>
          ) : (
            <dl className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 font-medium">
                  <Icon icon="lucide:atom" className="size-4" />
                  {t("library:protonDb.tier")}
                </dt>
                <dd>
                  <Badge variant="outline" className={cn("capitalize rounded-sm", TIER_STYLES[protonDbTier ?? ""])}>
                    {protonDbTier ?? "—"}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 font-medium">
                  <Icon icon="simple-icons:steamdeck" className="size-4" />
                  Steam Deck
                </dt>
                <dd>{t(`library:protonDb.deck.${DECK_STATUS[steamDeckCategory ?? 0] ?? "unknown"}`)}</dd>
              </div>
              {protonDbScore !== null && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 font-medium">
                    <Icon icon="lucide:star" className="size-4" />
                    {t("library:protonDb.score")}
                  </dt>
                  <dd className="tabular-nums">
                    {new Intl.NumberFormat(i18n.language, { style: "percent", maximumFractionDigits: 0 }).format(
                      protonDbScore,
                    )}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
