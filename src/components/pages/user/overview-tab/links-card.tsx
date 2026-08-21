import { Icon } from "@iconify/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ApiTypes } from "@/lib/api";
import { resolveLink } from "@/lib/utils/social";
import { LinksModal } from "./links-modal";

interface LinksCardProps {
  user: ApiTypes.User;
  isOwner: boolean;
}

export function LinksCard({ user, isOwner }: LinksCardProps) {
  const { t } = useTranslation();

  const [editing, setEditing] = useState(false);

  const links = user.profile.links ?? [];
  const isEmpty = links.length === 0;

  const socials = links.filter((link) => resolveLink(link.url).platform !== null);
  const sites = links.filter((link) => resolveLink(link.url).platform === null);

  if (isEmpty && !isOwner) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:link" className="size-5" />

              {t("user:links")}
            </div>

            {isOwner && !isEmpty && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label={t("user:linksEdit")}
                className="cursor-pointer flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                <Icon icon="lucide:pencil" className="size-4" />
              </button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {isEmpty ? (
            <Empty className="border p-6">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Icon icon="lucide:link" />
                </EmptyMedia>

                <EmptyTitle>{t("user:noLinks")}</EmptyTitle>

                <EmptyDescription>{t("user:noLinksDescription")}</EmptyDescription>
              </EmptyHeader>

              <Button size="sm" onClick={() => setEditing(true)}>
                <Icon icon="lucide:plus" className="size-4" />

                {t("user:linksAdd")}
              </Button>
            </Empty>
          ) : (
            <>
              {socials.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {socials.map((link) => {
                    const resolved = resolveLink(link.url);

                    return (
                      <Tooltip key={link.id}>
                        <TooltipTrigger asChild>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={link.label}
                            className="flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                          >
                            <Icon icon={resolved.icon} className="size-5" />
                          </a>
                        </TooltipTrigger>

                        <TooltipContent>{link.label}</TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              )}

              {sites.length > 0 && (
                <ul className={`flex flex-col ${socials.length > 0 ? "border-t border-border pt-2" : ""}`}>
                  {sites.map((link) => (
                    <li key={link.id} className="flex items-center justify-between gap-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-gray-300">{link.label}</p>

                        <p className="truncate text-xs text-muted-foreground">{resolveLink(link.url).hostname}</p>
                      </div>

                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={link.label}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Icon icon="lucide:external-link" className="size-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {isOwner && <LinksModal open={editing} onOpenChange={setEditing} user={user} />}
    </>
  );
}
