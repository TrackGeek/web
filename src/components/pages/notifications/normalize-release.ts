import type { TFunction } from "i18next";
import type { ApiTypes } from "@/lib/api";

type ReleaseMediaRoute = "/anime/$slug" | "/manga/$slug" | "/tv/$slug" | "/game/$slug";

export interface ReleaseNotificationData {
  headline: string;
  mediaTitle: string;
  unitTitle: string | null;
  coverURL: string;
  icon: string;
  releaseAt: Date;
  reopened: boolean;
  media: { to: ReleaseMediaRoute; slug: string } | null;
}

const RELEASE_ICONS: Record<ApiTypes.ReleaseEventType, string> = {
  NewEpisodeReleased: "lucide:monitor-play",
  NewChapterReleased: "lucide:book-open",
  NewGameReleased: "lucide:gamepad-2",
  SequelAdded: "lucide:sparkles",
};

interface ResolvedReleaseMedia {
  title: string;
  cover: string;
  link: { to: ReleaseMediaRoute; slug: string };
}

function resolveMedia(releaseEvent: ApiTypes.NotificationReleaseEvent): ResolvedReleaseMedia | null {
  if (releaseEvent.anime) {
    return {
      title: releaseEvent.anime.title,
      cover: releaseEvent.anime.imageUrl ?? "",
      link: { to: "/anime/$slug", slug: String(releaseEvent.anime.malId ?? releaseEvent.anime.id) },
    };
  }
  if (releaseEvent.manga) {
    return {
      title: releaseEvent.manga.title,
      cover: releaseEvent.manga.imageUrl ?? "",
      link: {
        to: "/manga/$slug",
        slug: String(releaseEvent.manga.anilistId ?? releaseEvent.manga.malId ?? releaseEvent.manga.id),
      },
    };
  }
  if (releaseEvent.tvShow) {
    return {
      title: releaseEvent.tvShow.name ?? releaseEvent.title,
      cover: releaseEvent.tvShow.posterUrl ?? "",
      link: { to: "/tv/$slug", slug: String(releaseEvent.tvShow.tmdbId ?? releaseEvent.tvShow.id) },
    };
  }
  if (releaseEvent.game) {
    return {
      title: releaseEvent.game.name,
      cover: releaseEvent.game.coverUrl ?? "",
      link: { to: "/game/$slug", slug: String(releaseEvent.game.igdbId ?? releaseEvent.game.id) },
    };
  }
  return null;
}

function buildHeadline(releaseEvent: ApiTypes.NotificationReleaseEvent, title: string, t: TFunction): string {
  const { unitNumber, containerNumber } = releaseEvent;

  switch (releaseEvent.type) {
    case "NewEpisodeReleased":
      if (unitNumber == null) {
        return t("notifications:release.episodeUnknown", { title });
      }
      return containerNumber == null
        ? t("notifications:release.episode", { number: unitNumber, title })
        : t("notifications:release.seasonEpisode", { season: containerNumber, number: unitNumber, title });

    case "NewChapterReleased":
      return unitNumber == null
        ? t("notifications:release.chapterUnknown", { title })
        : t("notifications:release.chapter", { number: unitNumber, title });

    case "NewGameReleased":
      return t("notifications:release.game", { title });

    case "SequelAdded":
      return t("notifications:release.sequel", { title });

    default:
      return title;
  }
}

/**
 * Turns a catch-up notification into the view-model the item card renders. Returns null when the
 * notification carries no release event (comment/reaction/system notifications).
 */
export function normalizeReleaseNotification(
  notification: ApiTypes.Notification,
  t: TFunction,
): ReleaseNotificationData | null {
  const { releaseEvent } = notification;

  if (!releaseEvent) {
    return null;
  }

  const media = resolveMedia(releaseEvent);
  const mediaTitle = media?.title || releaseEvent.title;

  return {
    headline: buildHeadline(releaseEvent, mediaTitle, t),
    mediaTitle,
    unitTitle: releaseEvent.unitTitle,
    coverURL: media?.cover ?? "",
    icon: RELEASE_ICONS[releaseEvent.type] ?? "lucide:bell",
    releaseAt: new Date(releaseEvent.releaseAt),
    reopened: notification.metadata?.reopened === true,
    media: media?.link ?? null,
  };
}
