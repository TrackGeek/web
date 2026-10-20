import { Icon } from "@iconify/react";
import { Image } from "@unpic/react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BookEdition } from "@/types/book";

interface EditionCardProps {
  edition: BookEdition;
  fallbackTitle: string;
  selected: boolean;
  canCustomize: boolean;
  isPending: boolean;
  onUseCover: () => void;
}

export function EditionCard({
  edition,
  fallbackTitle,
  selected,
  canCustomize,
  isPending,
  onUseCover,
}: EditionCardProps) {
  const { t } = useTranslation();
  const meta = [edition.editionFormat, edition.language, edition.releaseYear ? String(edition.releaseYear) : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex gap-3 p-3 bg-muted/50 rounded-lg border border-border">
      <Image
        src={edition.imageUrl || "/placeholder/cover.webp"}
        width={72}
        height={108}
        alt={edition.title ?? fallbackTitle}
        className="w-18 h-27 shrink-0 object-cover rounded-md"
      />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start gap-1">
          <p className="flex-1 min-w-0 font-medium text-card-foreground line-clamp-2">
            {edition.title ?? fallbackTitle}
          </p>
          {canCustomize && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("library:editionCoverOptions", { title: edition.title ?? fallbackTitle })}
                  disabled={isPending}
                >
                  <Icon icon="lucide:ellipsis" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled={isPending || !edition.imageUrl} onSelect={onUseCover}>
                  <Icon icon="lucide:image" aria-hidden="true" />
                  {t("library:useThisCover")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {edition.publisher && <p className="text-sm text-muted-foreground line-clamp-1">{edition.publisher}</p>}
        {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
        {!!edition.numberOfPages && (
          <p className="text-xs text-muted-foreground">
            {t("library:editionPageCount", { count: edition.numberOfPages })}
          </p>
        )}
        {edition.isbn13 && <p className="text-xs text-muted-foreground break-all">ISBN 13: {edition.isbn13}</p>}
        {edition.isbn10 && <p className="text-xs text-muted-foreground break-all">ISBN 10: {edition.isbn10}</p>}
        {selected && (
          <p className="flex items-center gap-1 text-xs text-primary">
            <Icon icon="lucide:check" aria-hidden="true" />
            {t("library:usingThisCover")}
          </p>
        )}
      </div>
    </div>
  );
}
