import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid";
import { CardItem } from "@/components/shared/cards/card";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingFiltered } from "@/components/shared/loadings/filtered.tsx";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useSearchPeople } from "@/hooks/person";
import { useInfiniteScroll } from "@/lib/utils/useInfiniteScroll.ts";

export function CastSearchResults({ query }: { query: string }) {
  const { t } = useTranslation();

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useSearchPeople(query);

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage);

  const people = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="flex-1 space-y-4">
      {isError && <ErrorComponent />}

      {isLoading && <LoadingFiltered />}

      {!isLoading && !isError && people.length === 0 && (
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon="lucide:search-x" />
            </EmptyMedia>
            <EmptyTitle>{t("user:noSearchResults")}</EmptyTitle>
            <EmptyDescription>{t("user:noSearchResultsDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!isLoading && !isError && people.length > 0 && (
        <Grid minColSize="128px" className="grid gap-6">
          {people.map((person) => (
            <CardItem
              key={person.tmdbId}
              title={person.name}
              url={`/cast/${person.slug}`}
              imageURL={person.imageUrl}
              isAdult={person.isAdult}
            />
          ))}
        </Grid>
      )}

      <div ref={sentinelRef} className="h-px" />

      {isFetchingNextPage && <LoadingFiltered />}
    </div>
  );
}
