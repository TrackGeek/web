import type { ReactElement } from "react";
import { ImageResponse } from "takumi-js/response";
import type { ApiTypes } from "@/lib/api";
import { api, apiEndpoints } from "@/lib/api";
import { loadMediaCard, type OgMediaType } from "@/lib/og/media-source";
import { ogFonts, ogImages, safeImageUrl } from "@/lib/og/resources";
import { MediaCard } from "@/lib/og/templates/media";
import { PageCard } from "@/lib/og/templates/page";
import { UserCard, type UserCardStat } from "@/lib/og/templates/user";
import { formatCount, OG_CACHE_CONTROL, OG_HEIGHT, OG_WIDTH } from "@/lib/og/theme";

async function toImage(element: ReactElement) {
  const response = new ImageResponse(element, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    format: "png",
    fonts: await ogFonts(),
    images: ogImages(),
    stylesheets: ["* { box-sizing: border-box; }"],
    headers: { "cache-control": OG_CACHE_CONTROL },
  });

  await response.ready;

  return response;
}

async function withFallback(build: () => Promise<ReactElement>, fallback: ReactElement) {
  try {
    return await toImage(await build());
  } catch {
    return toImage(fallback);
  }
}

export function renderPageOg(title: string, description?: string | null) {
  return withFallback(async () => <PageCard title={title} description={description} />, <PageCard title="TrackGeek" />);
}

export function renderMediaOg(type: OgMediaType, slug: string) {
  return withFallback(
    async () => {
      const card = await loadMediaCard(type, slug);

      return <MediaCard {...card} posterUrl={safeImageUrl(card.posterUrl)} />;
    },
    <PageCard title="TrackGeek" description="Track anime, games, movies, TV shows, manga and books." />,
  );
}

export function renderUserOg(username: string) {
  return withFallback(
    async () => {
      const { data } = await api.get<ApiTypes.GetUserByUsernameResponse>(apiEndpoints.getUserByUsername(username));
      const user = data.user;
      const tracked = Object.values(user.progressStats).reduce((total, stats) => total + stats.total, 0);

      const stats: UserCardStat[] = [
        { label: "TRACKED", value: formatCount(tracked), highlight: true },
        { label: "FOLLOWERS", value: formatCount(user._count.followers) },
        { label: "FOLLOWING", value: formatCount(user._count.following) },
        { label: "MEMBER SINCE", value: String(new Date(user.createdAt).getFullYear()) },
      ];

      return (
        <UserCard
          displayName={user.displayUsername || user.name}
          username={user.username}
          about={user.profile?.about}
          avatarUrl={safeImageUrl(user.profile?.avatarUrl)}
          bannerUrl={safeImageUrl(user.profile?.bannerUrl)}
          stats={stats}
        />
      );
    },
    <PageCard title={`@${username}`} description="TrackGeek profile" />,
  );
}
