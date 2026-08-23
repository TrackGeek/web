import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useTranslation } from "react-i18next";
import { FollowButton } from "@/components/pages/user/follow-button";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchUsers } from "@/hooks/user";
import { useInfiniteScroll } from "@/lib/utils/useInfiniteScroll.ts";

function UserSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="size-9 shrink-0 rounded-full" />
      <div className="flex flex-col gap-1.5 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function UserSearchResults({ query }: { query: string }) {
  const { t } = useTranslation();

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useSearchUsers(query);

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage);

  const users = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="flex-1 space-y-4">
      {isError && <ErrorComponent />}

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <UserSkeleton key={index} />
          ))}
        </div>
      )}

      {!isLoading && !isError && users.length === 0 && (
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

      {!isLoading && !isError && users.length > 0 && (
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <Avatar className="size-9 shrink-0 border border-border/50">
                {user.profile?.avatarUrl ? (
                  <Image
                    className="aspect-square size-full"
                    src={user.profile.avatarUrl}
                    width={36}
                    height={36}
                    alt={user.username}
                  />
                ) : (
                  <AvatarFallback>{(user.username || "?").charAt(0).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>

              <div className="min-w-0 flex-1 flex flex-col">
                <Link
                  to="/user/$username"
                  params={{ username: user.username }}
                  className="truncate text-sm font-semibold text-card-foreground hover:underline"
                >
                  {user.name}
                </Link>
                <span className="truncate text-xs text-muted-foreground">@{user.username}</span>
              </div>

              <FollowButton userId={user.id} username={user.username} />
            </div>
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-px" />

      {isFetchingNextPage && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <UserSkeleton key={index} />
          ))}
        </div>
      )}
    </div>
  );
}
