import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ListGroupItem } from "@/components/pages/details/list";
import { SearchInput } from "@/components/shared/search-input";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useLists } from "@/hooks/list";
import { useDebounce } from "@/lib/utils/useDebounce";

export function UserListsTab({ userId, isOwner }: { userId: string; isOwner: boolean }) {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 600);

  const listsQuery = useLists(userId, debouncedQuery);

  const groups = listsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && listsQuery.hasNextPage && !listsQuery.isFetchingNextPage) {
          listsQuery.fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [listsQuery.hasNextPage, listsQuery.isFetchingNextPage, listsQuery.fetchNextPage]);

  return (
    <div className="flex flex-col gap-5">
      <SearchInput value={searchQuery} onChange={setSearchQuery} />

      {listsQuery.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <ListSkeleton key={index} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon="lucide:list" />
            </EmptyMedia>
            <EmptyTitle>{t("library:noLists")}</EmptyTitle>
            <EmptyDescription>{t("library:noListsDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {groups.map((group) => (
            <ListGroupItem key={group.key} group={group} editable={isOwner} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} />

      {listsQuery.isFetchingNextPage && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <ListSkeleton key={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border flex flex-col gap-2">
      <div className="flex -space-x-3">
        <Skeleton className="aspect-video w-24 rounded-md" />
        <Skeleton className="aspect-video w-24 rounded-md" />
        <Skeleton className="aspect-video w-24 rounded-md" />
      </div>
      <Skeleton className="h-5 w-2/3" />
      <div className="flex items-center gap-2 mt-1">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}
