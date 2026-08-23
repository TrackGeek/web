import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useWatchLinks } from "@/hooks/watch-link";
import { resolveWatchLinks, type WatchLinkContext } from "@/lib/watch-links";

interface CustomWatchLinksProps {
  context: WatchLinkContext;
}

export function CustomWatchLinks({ context }: CustomWatchLinksProps) {
  const { t } = useTranslation();

  const watchLinksQuery = useWatchLinks();

  const entries = resolveWatchLinks(watchLinksQuery.data, context);

  if (entries.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-card-foreground text-lg">{t("library:watchLinks.title")}</h3>

        <Button variant="ghost" size="sm" asChild>
          <Link to="/settings" className="gap-1 text-muted-foreground text-xs">
            <Icon icon="lucide:settings" className="size-3.5" />
            {t("library:watchLinks.manage")}
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {entries.map(({ link, url }) => (
          <Button key={link.id} variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer" className="gap-2">
              <Icon icon="lucide:play" className="size-3.5 text-primary" />

              <span className="truncate">{link.label}</span>

              <Icon icon="lucide:external-link" className="size-3 text-muted-foreground" />
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}
