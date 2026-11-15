import { Icon } from "@iconify/react";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { ContentType } from "@/components/layouts/filters";
import { Grid } from "@/components/layouts/grid";
import { CardItem } from "@/components/shared/cards/card";
import { ErrorComponent } from "@/components/shared/error";
import { LoadingFiltered } from "@/components/shared/loadings/filtered";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

type SearchResultsProps = {
  items: Array<{
    anilistId?: number;
    malId?: number;
    tmdbId?: number;
    hardcoverId?: number;
    igdbId?: number;
    title?: string;
    name?: string;
    imageUrl?: string;
    coverUrl?: string;
    posterUrl?: string;
    isAdult?: boolean;
  }>;
  contentType: ContentType;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  sentinelRef: React.Ref<HTMLDivElement>;
};

export const SearchResults = memo(
  ({ items, contentType, isLoading, isError, isFetchingNextPage, sentinelRef }: SearchResultsProps) => {
    const { t } = useTranslation();

    return (
      <div className="flex-1 md:w-2/3 space-y-4">
        {isError && <ErrorComponent />}

        {isLoading && <LoadingFiltered />}

        {!isLoading && !isError && items.length === 0 && (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon icon="lucide:search-x" />
              </EmptyMedia>
              <EmptyTitle>{t("common:noResults")}</EmptyTitle>
              <EmptyDescription>{t("common:noResultsDescription")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <Grid minColSize="128px" className="grid gap-6">
            {items.map((item) => (
              <CardItem
                key={item.anilistId ?? item.malId ?? item.tmdbId ?? item.hardcoverId ?? item.igdbId}
                title={item.title ?? item.name ?? ""}
                url={`/${contentType}/${item.anilistId ?? item.malId ?? item.tmdbId ?? item.hardcoverId ?? item.igdbId}`}
                imageURL={item.imageUrl ?? item.coverUrl ?? item.posterUrl ?? null}
                isAdult={item.isAdult}
              />
            ))}
          </Grid>
        )}

        <div ref={sentinelRef} className="h-px" />

        {isFetchingNextPage && <LoadingFiltered />}
      </div>
    );
  },
);
