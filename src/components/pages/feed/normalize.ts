import type { ScreenshotImage } from "@/components/shared/cards/screenshot";
import type { ApiTypes } from "@/lib/api";

export type FeedMediaRoute =
  | "/anime/$slug"
  | "/manga/$slug"
  | "/tv/$slug"
  | "/movie/$slug"
  | "/game/$slug"
  | "/book/$slug"
  | "/cast/$slug";

export interface FeedMediaLink {
  to: FeedMediaRoute;
  slug: string;
}

export type FeedHighlightLink =
  | { to: FeedMediaRoute; params: { slug: string } }
  | { to: "/user/$username"; params: { username: string }; search: { tab: string } };

export interface FeedProfile {
  name: string;
  avatarURL: string;
  username?: string;
}

export interface FeedCriteria {
  labelKey: string;
  value: number;
}

export interface FeedItemData {
  coverURL: string;
  icon?: string;
  titleKey: string;
  titleValues?: Record<string, string | number>;
  titleLink?: FeedHighlightLink;
  mediaTitle?: string;
  content?: string;
  time: Date;
  likes?: number;
  comments?: number;
  media?: FeedMediaLink;
  activityId?: string;
  reactions?: ApiTypes.ActivityReaction[];
}

const ACTIVITY_ICONS: Record<ApiTypes.ActivityType, string> = {
  ReviewAdded: "lucide:star",
  Watched: "lucide:monitor-play",
  ProgressStarted: "lucide:play",
  ProgressCompleted: "lucide:circle-check",
  ProgressPaused: "lucide:pause",
  ProgressDropped: "lucide:circle-x",
  ProgressPlanned: "lucide:clock",
  FavoriteAdded: "lucide:heart",
  ListItemAdded: "lucide:list-plus",
  ListCreated: "lucide:list",
  Followed: "lucide:user-plus",
  MedalEarned: "lucide:medal",
  AccountCreated: "lucide:party-popper",
  ScreenshotAdded: "lucide:image",
  PostCreated: "lucide:message-square-text",
};

export interface FeedReviewData extends FeedItemData {
  criteries: { all: number; breakdown: FeedCriteria[] };
}

export interface FeedScreenshotData extends FeedItemData {
  screenshots: ScreenshotImage[];
}

export interface FeedPostData extends FeedItemData {
  postId: string;
  authorId: string;
  content: string;
  isSpoiler: boolean;
}

export type FeedRenderItem =
  | { kind: "review"; profile: FeedProfile; item: FeedReviewData }
  | { kind: "screenshot"; profile: FeedProfile; item: FeedScreenshotData }
  | { kind: "post"; profile: FeedProfile; item: FeedPostData }
  | { kind: "item"; profile: FeedProfile; item: FeedItemData };

interface ResolvedMedia {
  title: string;
  cover: string;
  media: FeedMediaLink;
}

function toNumber(value: number | string | null | undefined): number {
  return typeof value === "string" ? Number(value) : (value ?? 0);
}

function resolveMedia(refs: ApiTypes.ActivityMediaRefs | null | undefined): ResolvedMedia | null {
  if (!refs) return null;
  if (refs.anime) {
    return {
      title: refs.anime.title ?? "",
      cover: refs.anime.imageUrl ?? "",
      media: { to: "/anime/$slug", slug: String(refs.anime.malId ?? refs.anime.id) },
    };
  }
  if (refs.manga) {
    return {
      title: refs.manga.title ?? "",
      cover: refs.manga.imageUrl ?? "",
      media: { to: "/manga/$slug", slug: String(refs.manga.anilistId ?? refs.manga.malId ?? refs.manga.id) },
    };
  }
  if (refs.tvShow) {
    return {
      title: refs.tvShow.name ?? "",
      cover: refs.tvShow.posterUrl ?? "",
      media: { to: "/tv/$slug", slug: String(refs.tvShow.tmdbId ?? refs.tvShow.id) },
    };
  }
  if (refs.movie) {
    return {
      title: refs.movie.title ?? "",
      cover: refs.movie.posterUrl ?? "",
      media: { to: "/movie/$slug", slug: String(refs.movie.tmdbId ?? refs.movie.id) },
    };
  }
  if (refs.game) {
    return {
      title: refs.game.name ?? "",
      cover: refs.game.coverUrl ?? "",
      media: { to: "/game/$slug", slug: String(refs.game.igdbId ?? refs.game.id) },
    };
  }
  if (refs.book) {
    return {
      title: refs.book.title ?? "",
      cover: refs.book.imageUrl ?? "",
      media: { to: "/book/$slug", slug: String(refs.book.hardcoverId ?? refs.book.id) },
    };
  }
  if (refs.person) {
    return {
      title: refs.person.name ?? "",
      cover: refs.person.imageUrl ?? "",
      media: { to: "/cast/$slug", slug: String(refs.person.slug ?? refs.person.id) },
    };
  }
  return null;
}

const REVIEW_KEYS = ["animeReview", "mangaReview", "tvShowReview", "movieReview", "gameReview", "bookReview"] as const;

const PROGRESS_KEYS = [
  "animeProgress",
  "mangaProgress",
  "tvShowProgress",
  "movieProgress",
  "gameProgress",
  "bookProgress",
] as const;

const CRITERIA_LABELS: Record<string, string> = {
  story: "story",
  characters: "characters",
  animation: "animation",
  sound: "soundtrack",
  enjoyment: "enjoyment",
  art: "art",
  worldbuilding: "worldbuilding",
  direction: "direction",
  production: "production",
  acting: "acting",
  graphics: "graphics",
  gameplay: "gameplay",
  language: "language",
  theme: "theme",
};

function firstReview(activity: ApiTypes.Activity): ApiTypes.ActivityReview | null {
  for (const key of REVIEW_KEYS) {
    const review = activity[key];
    if (review) return review;
  }
  return null;
}

function firstProgress(activity: ApiTypes.Activity): ApiTypes.ActivityProgress | null {
  for (const key of PROGRESS_KEYS) {
    const progress = activity[key];
    if (progress) return progress;
  }
  return null;
}

function mediaHighlight(media: FeedMediaLink): FeedHighlightLink {
  return { to: media.to, params: { slug: media.slug } };
}

function userHighlight(username: string, tab: string): FeedHighlightLink {
  return { to: "/user/$username", params: { username }, search: { tab } };
}

function buildProfile(user: ApiTypes.ActivityUser): FeedProfile {
  return {
    name: user.name || user.username,
    username: user.username,
    avatarURL: user.profile?.avatarUrl ?? "",
  };
}

export function normalizeActivityGroup(group: ApiTypes.ActivityGroup): FeedRenderItem | null {
  const activity = group.items[0];
  if (!activity?.user) return null;

  const profile = buildProfile(activity.user);
  const time = new Date(group.createdAt);
  const likes = activity._count?.reactions ?? activity.reactions?.length ?? 0;

  const entry = ((): FeedRenderItem | null => {
    switch (group.type) {
      case "ReviewAdded": {
        const review = firstReview(activity);
        const media = resolveMedia(review);
        if (!review || !media) return null;

        const breakdown: FeedCriteria[] = [];
        for (const [field, labelKey] of Object.entries(CRITERIA_LABELS)) {
          const raw = (review as unknown as Record<string, unknown>)[field];
          if (raw !== null && raw !== undefined) {
            breakdown.push({ labelKey, value: toNumber(raw as number | string) });
          }
        }

        return {
          kind: "review",
          profile,
          item: {
            coverURL: media.cover,
            media: media.media,
            mediaTitle: media.title,
            titleKey: "feed:reviewed",
            titleValues: { content: media.title },
            titleLink: mediaHighlight(media.media),
            content: review.summary ?? undefined,
            time,
            likes,
            criteries: { all: toNumber(review.overall), breakdown },
          },
        };
      }

      case "Watched": {
        const media = resolveMedia({ anime: activity.anime, tvShow: activity.tvShow });
        if (!media) return null;

        const meta = (activity.metadata ?? {}) as { from?: number; to?: number };
        const from = meta.from;
        const to = meta.to;
        if (from == null || to == null) return null;

        return {
          kind: "item",
          profile,
          item: {
            coverURL: media.cover,
            media: media.media,
            mediaTitle: media.title,
            titleKey: from === to ? "feed:watchedEpisodes" : "feed:watchedEpisodesRange",
            titleValues:
              from === to ? { episodeNumber: from, content: media.title } : { from, to, content: media.title },
            titleLink: mediaHighlight(media.media),
            time,
            likes,
          },
        };
      }

      case "ProgressStarted":
      case "ProgressCompleted":
      case "ProgressPaused":
      case "ProgressDropped":
      case "ProgressPlanned": {
        const progress = firstProgress(activity);
        const media = resolveMedia(progress);
        if (!progress || !media) return null;

        const TRACKING_KEYS: Record<string, string> = {
          ProgressCompleted: "feed:completedTracking",
          ProgressPaused: "feed:pausedTracking",
          ProgressDropped: "feed:droppedTracking",
          ProgressPlanned: "feed:plannedTracking",
        };

        const key = TRACKING_KEYS[group.type] ?? "feed:startedTracking";

        return {
          kind: "item",
          profile,
          item: {
            coverURL: media.cover,
            media: media.media,
            mediaTitle: media.title,
            titleKey: key,
            titleValues: { content: media.title },
            titleLink: mediaHighlight(media.media),
            time,
            likes,
          },
        };
      }

      case "ScreenshotAdded": {
        const screenshots = group.items.flatMap((item) => (item.gameScreenshot ? [item.gameScreenshot] : []));
        const first = screenshots[0];
        const media = resolveMedia({ game: first?.game });
        if (!first || !media) return null;

        return {
          kind: "screenshot",
          profile,
          item: {
            coverURL: media.cover,
            media: media.media,
            mediaTitle: media.title,
            titleKey: "feed:addScreenshots",
            titleValues: { content: media.title, count: screenshots.length },
            titleLink: mediaHighlight(media.media),
            time,
            likes,
            screenshots: screenshots.map((screenshot) => ({
              id: screenshot.id,
              url: screenshot.url,
              type: screenshot.type,
              description: screenshot.description,
              isSpoiler: screenshot.isSpoiler,
            })),
          },
        };
      }

      case "PostCreated": {
        const post = activity.post;
        if (!post) return null;

        const media = resolveMedia(post);

        return {
          kind: "post",
          profile,
          item: {
            coverURL: media?.cover ?? "",
            media: media?.media,
            mediaTitle: media?.title,
            titleKey: media ? "feed:postedAbout" : "feed:posted",
            titleValues: media ? { content: media.title } : undefined,
            titleLink: media ? mediaHighlight(media.media) : undefined,
            postId: post.id,
            authorId: activity.userId,
            content: post.content,
            isSpoiler: post.isSpoiler,
            time,
            likes,
          },
        };
      }

      case "FavoriteAdded": {
        const media = resolveMedia(activity.favorite);
        if (!media) return null;

        return {
          kind: "item",
          profile,
          item: {
            coverURL: media.cover,
            media: media.media,
            mediaTitle: media.title,
            titleKey: "feed:favorited",
            titleValues: { content: media.title },
            titleLink: mediaHighlight(media.media),
            time,
            likes,
          },
        };
      }

      case "ListItemAdded": {
        const media = resolveMedia(activity.listItem);
        if (!media) return null;

        return {
          kind: "item",
          profile,
          item: {
            coverURL: media.cover,
            media: media.media,
            mediaTitle: media.title,
            titleKey: "feed:addedToList",
            titleValues: { content: media.title },
            titleLink: mediaHighlight(media.media),
            time,
            likes,
          },
        };
      }

      case "ListCreated": {
        if (!activity.list) return null;

        return {
          kind: "item",
          profile,
          item: {
            coverURL: "",
            titleKey: "feed:createdList",
            titleValues: { content: activity.list.name },
            titleLink: profile.username ? userHighlight(profile.username, "lists") : undefined,
            time,
            likes,
          },
        };
      }

      case "Followed": {
        if (!activity.following) return null;
        const target = activity.following.following;

        return {
          kind: "item",
          profile,
          item: {
            coverURL: "",
            titleKey: "feed:followed",
            titleValues: { content: target.name || target.username },
            titleLink: target.username ? userHighlight(target.username, "overview") : undefined,
            time,
            likes,
          },
        };
      }

      case "MedalEarned": {
        if (!activity.userMedal) return null;

        return {
          kind: "item",
          profile,
          item: {
            coverURL: "",
            titleKey: "feed:earnedMedal",
            titleValues: { content: activity.userMedal.medal.name },
            time,
            likes,
          },
        };
      }

      case "AccountCreated": {
        return {
          kind: "item",
          profile,
          item: {
            coverURL: "",
            titleKey: "feed:joined",
            time,
            likes,
          },
        };
      }

      default:
        return null;
    }
  })();

  if (entry) {
    entry.item.icon = ACTIVITY_ICONS[group.type];
    entry.item.activityId = activity.id;
    entry.item.reactions = activity.reactions ?? [];
  }

  return entry;
}
