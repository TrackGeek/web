import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid";
import { Button } from "@/components/ui/button";
import { useBookCover } from "@/hooks/use-book-cover";
import { useSession } from "@/lib/auth/client";
import type { BookEdition } from "@/types/book";
import { EditionCard } from "./edition-card";

interface BookEditionsProps {
  hardcoverId: number;
  editions: BookEdition[];
  title: string;
  coverEditionId?: number | null;
  customCoverEditionId?: number | null;
}

export function BookEditions({
  hardcoverId,
  editions,
  title,
  coverEditionId,
  customCoverEditionId,
}: BookEditionsProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const mutation = useBookCover(hardcoverId);

  return (
    <div className="space-y-4" aria-busy={mutation.isPending}>
      {session && customCoverEditionId != null && (
        <Button variant="outline" size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate(null)}>
          {t("library:useDefaultCover")}
        </Button>
      )}
      <Grid minColSize="240px" className="gap-4 items-start">
        {editions.map((edition) => (
          <EditionCard
            key={edition.id}
            edition={edition}
            fallbackTitle={title}
            selected={coverEditionId === edition.id}
            canCustomize={!!session}
            isPending={mutation.isPending}
            onUseCover={() => mutation.mutate(edition.id)}
          />
        ))}
      </Grid>
    </div>
  );
}
