import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FollowButton } from "@/components/pages/user/follow-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useFollowers, useFollowing } from "@/hooks/follow";
import type { ApiTypes } from "@/lib/api";

type FollowsVariant = "followers" | "following";

function FollowsList({ userId, variant }: { userId: string; variant: FollowsVariant }) {
  const { t } = useTranslation();

  const followersQuery = useFollowers(variant === "followers" ? userId : "");
  const followingQuery = useFollowing(variant === "following" ? userId : "");

  const query = variant === "followers" ? followersQuery : followingQuery;

  const users = (query.data?.pages.flatMap((page) => page.items) ?? [])
    .map((item) => (variant === "followers" ? item.follower : item.following))
    .filter((user): user is ApiTypes.FollowUser => Boolean(user));

  const emptyTitleKey = variant === "followers" ? "user:noFollowers" : "user:noFollowing";
  const emptyDescriptionKey = variant === "followers" ? "user:noFollowersDescription" : "user:noFollowingDescription";

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && query.hasNextPage && !query.isFetchingNextPage) {
          query.fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  return (
    <div className="flex flex-col gap-3">
      {query.isLoading ? (
        Array.from({ length: 8 }).map((_, index) => <FollowSkeleton key={index} />)
      ) : users.length === 0 ? (
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon="lucide:users" />
            </EmptyMedia>
            <EmptyTitle>{t(emptyTitleKey)}</EmptyTitle>
            <EmptyDescription>{t(emptyDescriptionKey)}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        users.map((user) => (
          <div key={user.id} className="flex items-center gap-3">
            <Avatar className="size-9 shrink-0 border border-border/50">
              {user.profile.avatarUrl ? (
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
        ))
      )}

      <div ref={sentinelRef} />

      {query.isFetchingNextPage && Array.from({ length: 4 }).map((_, index) => <FollowSkeleton key={index} />)}
    </div>
  );
}

function FollowSkeleton() {
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

export function UserFollowersTab({ userId }: { userId: string }) {
  return <FollowsList userId={userId} variant="followers" />;
}

export function UserFollowingTab({ userId }: { userId: string }) {
  return <FollowsList userId={userId} variant="following" />;
}
