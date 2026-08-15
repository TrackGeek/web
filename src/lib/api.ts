import axios from "axios";
import i18n, { DEFAULT_LANGUAGE } from "./i18n/config";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "X-TrackGeek-Version": "1.0.0",
  },
});

api.interceptors.request.use((config) => {
  config.headers.set("X-TrackGeek-Language", i18n.language || DEFAULT_LANGUAGE);

  return config;
});

export namespace ApiTypes {
  export type PaymentFrequency = "Monthly" | "OneTime";

  export interface PriceValue {
    raw: number;
    formatted: string;
    currency: string;
  }

  export interface Price {
    id: string;
    productId: string;
    value: {
      converted: PriceValue;
      original: PriceValue;
    };
  }

  export type Perk = Price & {
    name: string;
  };

  export interface GetPricesResponse {
    prices: Price[];
  }

  export interface GetPerksResponse {
    perks: Perk[];
  }

  export interface CreatePaymentRequest {
    frequency: PaymentFrequency;
    value: number;
  }

  export interface CreatePaymentResponse {
    payment: {
      id: string;
      url: string;
    };
  }

  export interface GetCurrentSubscriptionResponse {
    subscription: {
      id: string;
      status: string;
      renewsAt: string;
      product: {
        id: string;
        name: string;
      };
      price: PriceValue;
    };
  }

  export interface GetCurrencyResponse {
    currency: string;
  }

  export type PaymentStatus = "Pending" | "Succeeded" | "Failed";

  export interface Payment {
    id: string;
    name: string;
    value: number;
    currency: string;
    status: PaymentStatus;
    frequency: PaymentFrequency;
    stripeInvoiceUrl: string | null;
    stripeCheckoutSessionUrl: string;
    stripePaymentIntentId: string | null;
    stripeCheckoutSessionId: string;
    stripeCustomerId: string;
    stripeProductId: string;
    user: {
      id: string;
      name: string;
      username: string;
      profile: {
        id: string;
        avatarUrl: string | null;
      };
    };
    expiredAt: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface PaginatedResponse<T> {
    total: number;
    count: number;
    pages: number;
    inPage: number;
    itemsInPage: number;
    itemsPerPage: number;
    items: T[];
  }

  export interface GetPaymentsResponse {
    payments: PaginatedResponse<Payment>;
  }

  export interface GetPaymentDetailsResponse {
    payment: Payment;
  }

  export interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    username: string;
    displayUsername: string;
    tier: string;
    tierStartedAt: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    profile: {
      id: string;
      userId: string;
      color: string;
      language: string;
      timezone: string;
      about: string;
      bannerUrl: string;
      avatarUrl: string;
      contentTypes: ContentType[];
      createdAt: string;
      updatedAt: string;
    };
    _count: {
      followers: number;
      following: number;
    };
    userMedals: {
      medal: {
        id: string;
        name: string;
        imageUrl: string;
        createdAt: string;
        updatedAt: string;
      };
    }[];
    progressStats: {
      anime: {
        total: number;
        watching: {
          count: number;
          percentage: number;
        };
        completed: {
          count: number;
          percentage: number;
        };
        paused: {
          count: number;
          percentage: number;
        };
        dropped: {
          count: number;
          percentage: number;
        };
        planning: {
          count: number;
          percentage: number;
        };
      };
      manga: {
        total: number;
        reading: {
          count: number;
          percentage: number;
        };
        completed: {
          count: number;
          percentage: number;
        };
        paused: {
          count: number;
          percentage: number;
        };
        dropped: {
          count: number;
          percentage: number;
        };
        planning: {
          count: number;
          percentage: number;
        };
      };
      tvShow: {
        total: number;
        watching: {
          count: number;
          percentage: number;
        };
        completed: {
          count: number;
          percentage: number;
        };
        paused: {
          count: number;
          percentage: number;
        };
        dropped: {
          count: number;
          percentage: number;
        };
        planning: {
          count: number;
          percentage: number;
        };
      };
      movie: {
        total: number;
        completed: {
          count: number;
          percentage: number;
        };
        paused: {
          count: number;
          percentage: number;
        };
        dropped: {
          count: number;
          percentage: number;
        };
        planning: {
          count: number;
          percentage: number;
        };
      };
      game: {
        total: number;
        playing: {
          count: number;
          percentage: number;
        };
        completed: {
          count: number;
          percentage: number;
        };
        paused: {
          count: number;
          percentage: number;
        };
        dropped: {
          count: number;
          percentage: number;
        };
        planning: {
          count: number;
          percentage: number;
        };
      };
      book: {
        total: number;
        reading: {
          count: number;
          percentage: number;
        };
        completed: {
          count: number;
          percentage: number;
        };
        paused: {
          count: number;
          percentage: number;
        };
        dropped: {
          count: number;
          percentage: number;
        };
        planning: {
          count: number;
          percentage: number;
        };
      };
    };
    counts: {
      lists: number;
      favorites: number;
      reviews: number;
      screenshots: number;
    };
    latestReviewType: ReviewContentType | null;
    latestProgressType: ReviewContentType | null;
    latestFavoriteType: FavoriteType | null;
  }

  export interface GetUserByUsernameResponse {
    user: User;
  }

  export interface FollowStatus {
    isFollowing: boolean;
    followsYou: boolean;
  }

  export interface GetFollowStatusResponse {
    followStatus: FollowStatus;
  }

  export interface FollowUser {
    id: string;
    name: string;
    username: string;
    profile: { id: string; avatarUrl: string | null };
  }

  export interface Following {
    id: string;
    followerId: string;
    followingId: string;
    createdAt: string;
    follower?: FollowUser;
    following?: FollowUser;
  }

  export interface SearchUser {
    id: string;
    name: string;
    username: string;
    profile: { id: string; avatarUrl: string | null } | null;
  }

  export interface SearchUsersResponse {
    users: PaginatedResponse<SearchUser>;
  }

  export interface GetFollowersResponse {
    followers: PaginatedResponse<Following>;
  }

  export interface GetFollowingResponse {
    following: PaginatedResponse<Following>;
  }

  export type CommentType = "Anime" | "Manga" | "TVShow" | "Movie" | "Game" | "Book" | "Profile";

  export interface CommentReaction {
    id: string;
    emoji: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
    };
  }

  export interface Comment {
    id: string;
    content: string;
    type: CommentType;
    isSpoiler: boolean;
    userId: string;
    parentId: string | null;
    animeId: string | null;
    mangaId: string | null;
    tvShowId: string | null;
    movieId: string | null;
    gameId: string | null;
    bookId: string | null;
    profileId: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      name: string;
      username: string;
      profile: {
        id: string;
        avatarUrl: string | null;
      };
    };
    reactions: CommentReaction[];
    replies?: Comment[];
  }

  export interface GetCommentsResponse {
    comments: PaginatedResponse<Comment>;
  }

  export type ReactionType =
    | "Comment"
    | "Activity"
    | "GameReview"
    | "AnimeReview"
    | "MangaReview"
    | "TvShowReview"
    | "MovieReview"
    | "BookReview";

  export type NotificationType =
    | "System"
    | "CommentOnProfile"
    | "ReactionOnComment"
    | "ReactionOnActivity"
    | "ReactionOnAnimeReview"
    | "ReactionOnMangaReview"
    | "ReactionOnTvShowReview"
    | "ReactionOnMovieReview"
    | "ReactionOnGameReview"
    | "ReactionOnBookReview"
    | "NewEpisodeReleased"
    | "NewChapterReleased"
    | "NewGameReleased"
    | "SequelAdded";

  export type CatchupMediaType = "Anime" | "Manga" | "TvShow" | "Game";

  export type ReleaseEventType = "NewEpisodeReleased" | "NewChapterReleased" | "NewGameReleased" | "SequelAdded";

  // Release that triggered a catch-up notification, with the media relation it was matched to so the
  // notification can show a cover and link to the title page.
  export interface NotificationReleaseEvent {
    id: string;
    type: ReleaseEventType;
    mediaType: CatchupMediaType;
    title: string;
    unitTitle: string | null;
    unitNumber: number | null;
    containerNumber: number | null;
    releaseAt: string;
    anime: { id: string; malId: number; title: string; imageUrl: string | null } | null;
    manga: {
      id: string;
      anilistId: number | null;
      malId: number | null;
      title: string;
      imageUrl: string | null;
    } | null;
    tvShow: { id: string; tmdbId: number; name: string | null; posterUrl: string | null } | null;
    game: { id: string; igdbId: number; slug: string | null; name: string; coverUrl: string | null } | null;
  }

  // titleKey/descriptionKey are i18n keys resolved at render time; title/description are literals
  // used when the content has no translation.
  export interface SystemNotificationMetadata {
    title?: string;
    titleKey?: string;
    description?: string;
    descriptionKey?: string;
    url?: string;
    [key: string]: unknown;
  }

  export interface Notification {
    id: string;
    type: NotificationType;
    recipientId: string;
    actorId: string | null;
    metadata: SystemNotificationMetadata | null;
    readAt: string | null;
    createdAt: string;
    profileId: string | null;
    commentId: string | null;
    reactionId: string | null;
    activityId: string | null;
    animeReviewId: string | null;
    mangaReviewId: string | null;
    tvShowReviewId: string | null;
    movieReviewId: string | null;
    gameReviewId: string | null;
    bookReviewId: string | null;
    releaseEventId: string | null;
    actor: {
      id: string;
      name: string;
      username: string;
      profile: {
        id: string;
        avatarUrl: string | null;
      } | null;
    } | null;
    comment: {
      id: string;
      type: CommentType;
      content: string;
    } | null;
    reaction: {
      id: string;
      type: ReactionType;
      emoji: string;
    } | null;
    releaseEvent: NotificationReleaseEvent | null;
  }

  export interface GetNotificationsResponse {
    notifications: PaginatedResponse<Notification>;
  }

  export interface GetUnreadNotificationsCountResponse {
    count: number;
  }

  export interface NotificationPreferences {
    comment: boolean;
    reaction: boolean;
    newEpisode: boolean;
    newChapter: boolean;
    gameRelease: boolean;
    sequelAdded: boolean;
    reopenedCompleted: boolean;
  }

  export interface GetNotificationPreferencesResponse {
    preferences: NotificationPreferences;
  }

  export interface UpdateNotificationPreferencesResponse {
    preferences: NotificationPreferences;
  }

  export type ContentType = "Anime" | "Manga" | "TVShow" | "Movie" | "Game" | "Book";

  export type FavoriteType = ContentType;

  export interface Favorite {
    id: string;
    type: FavoriteType;
    createdAt: string;
    anime: { id: string; malId: number; title: string; imageUrl: string | null } | null;
    manga: {
      id: string;
      anilistId: number | null;
      malId: number | null;
      title: string;
      imageUrl: string | null;
    } | null;
    tvShow: { id: string; tmdbId: number; name: string; posterUrl: string | null } | null;
    movie: { id: string; tmdbId: number; title: string; posterUrl: string | null } | null;
    game: { id: string; igdbId: number; name: string; coverUrl: string | null } | null;
    book: { id: string; hardcoverId: number; title: string; imageUrl: string | null } | null;
  }

  export interface GetFavoritesByUserIdResponse {
    favorites: PaginatedResponse<Favorite>;
  }

  export interface GetFavoriteStatusResponse {
    favorited: boolean;
  }

  /** User progress statuses (mirrors the backend `ProgressStatus` enum). */
  export type ProgressStatus =
    | "NotWatched"
    | "NotRead"
    | "NotPlayed"
    | "Watching"
    | "Playing"
    | "Reading"
    | "Rewatching"
    | "Replaying"
    | "Rereading"
    | "Completed"
    | "Paused"
    | "Dropped"
    | "Planning";

  export interface Progress {
    id: string;
    status: ProgressStatus;
    anime: { id: string; malId: number; title: string; imageUrl: string | null } | null;
    manga: {
      id: string;
      anilistId: number | null;
      malId: number | null;
      title: string;
      imageUrl: string | null;
    } | null;
    tvShow: { id: string; tmdbId: number; name: string; posterUrl: string | null } | null;
    movie: { id: string; tmdbId: number; title: string; posterUrl: string | null } | null;
    game: { id: string; igdbId: number; name: string; coverUrl: string | null } | null;
    book: { id: string; hardcoverId: number; title: string; imageUrl: string | null } | null;
  }

  export type MediaReleaseState = "Unreleased" | "Ongoing" | "Hiatus" | "Finished" | "Cancelled";

  export type ProgressStatusCounts = Partial<Record<ProgressStatus, number>>;

  export type ProgressSortBy = "name" | "addedAt" | "updatedAt" | "releaseDate";

  export type ProgressSortOrder = "asc" | "desc";

  export interface GetProgressResponse {
    animeProgresses?: PaginatedResponse<Progress>;
    mangaProgresses?: PaginatedResponse<Progress>;
    tvShowProgresses?: PaginatedResponse<Progress>;
    movieProgresses?: PaginatedResponse<Progress>;
    gameProgresses?: PaginatedResponse<Progress>;
    bookProgresses?: PaginatedResponse<Progress>;
    /** Totals per progress status under the same filters, regardless of the requested status. */
    statusCounts: ProgressStatusCounts;
  }

  /** Filter values present in the user's library — options that cannot match are never offered. */
  export interface ProgressFilterOptions {
    genres: string[];
    years: number[];
    releaseStates: MediaReleaseState[];
  }

  export interface GetProgressFiltersResponse {
    filters: ProgressFilterOptions;
  }

  export interface FavoriteRequest {
    type: FavoriteType;
    position?: number;
    animeId?: string;
    mangaId?: string;
    tvShowId?: string;
    movieId?: string;
    gameId?: string;
    bookId?: string;
  }

  export type ListType = FavoriteType;

  export interface AddItemToListRequest {
    type: ListType;
    listId: string;
    position?: number;
    animeId?: string;
    mangaId?: string;
    tvShowId?: string;
    movieId?: string;
    gameId?: string;
    bookId?: string;
  }

  export type RemoveItemFromListRequest = AddItemToListRequest;

  export interface UpdateListRequest {
    name?: string;
    description?: string;
  }

  export interface List {
    id: string;
    name: string;
    description: string | null;
    type: ListType;
    user: {
      id: string;
      name: string;
      username: string;
      profile: { id: string; avatarUrl: string | null };
    };
  }

  export interface GetListsByUserIdResponse {
    lists: PaginatedResponse<ListWithPreview>;
  }

  export interface ListItem {
    id: string;
    anime: { id: string; malId: number; title: string; imageUrl: string | null } | null;
    manga: {
      id: string;
      anilistId: number | null;
      malId: number | null;
      title: string;
      imageUrl: string | null;
    } | null;
    tvShow: { id: string; tmdbId: number; name: string; posterUrl: string | null } | null;
    movie: { id: string; tmdbId: number; title: string; posterUrl: string | null } | null;
    game: { id: string; igdbId: number; name: string; coverUrl: string | null } | null;
    book: { id: string; hardcoverId: number; title: string; imageUrl: string | null } | null;
  }

  export interface GetItemsByListIdResponse {
    listItems: PaginatedResponse<ListItem>;
  }

  export interface ListWithPreview extends List {
    _count: { listItems: number };
    listItems: ListItem[];
  }

  export interface ListGroup {
    key: string;
    name: string;
    lists: ListWithPreview[];
  }

  export interface GetGroupedListsByUserIdResponse {
    lists: PaginatedResponse<ListGroup>;
  }

  export interface GetListsContainingItemResponse {
    lists: PaginatedResponse<ListWithPreview>;
  }

  export interface GetListStatusResponse {
    listIds: string[];
  }

  export interface TVShowReview {
    id: string;
    overall: number | string;
    direction: number | string | null;
    production: number | string | null;
    acting: number | string | null;
    summary: string | null;
    notes: string | null;
    story: string | null;
    recommended: boolean | null;
    userId: string;
    tvShowId: string;
    createdAt: string;
    user: User;
    reactions?: ReviewReaction[];
  }

  export interface GetTVShowReviewsResponse {
    tvShowReviews: PaginatedResponse<TVShowReview>;
  }

  export type ReviewContentType = "tv" | "movie" | "game" | "anime" | "book" | "manga";

  export interface ReviewMediaSummary {
    id?: string;
    name?: string | null;
    title?: string | null;
    coverUrl?: string | null;
    posterUrl?: string | null;
    imageUrl?: string | null;
  }

  export interface ReviewReaction {
    id: string;
    emoji: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
    };
  }

  export interface Review {
    id: string;
    overall: number | string;
    direction?: number | string | null;
    production?: number | string | null;
    acting?: number | string | null;
    graphics?: number | string | null;
    sound?: number | string | null;
    gameplay?: number | string | null;
    characters?: number | string | null;
    animation?: number | string | null;
    enjoyment?: number | string | null;
    language?: number | string | null;
    theme?: number | string | null;
    art?: number | string | null;
    worldbuilding?: number | string | null;
    story?: string | null;
    summary?: string | null;
    notes?: string | null;
    recommended?: boolean | null;
    userId: string;
    createdAt: string;
    user: User;
    game?: ReviewMediaSummary | null;
    movie?: ReviewMediaSummary | null;
    tvShow?: ReviewMediaSummary | null;
    anime?: ReviewMediaSummary | null;
    book?: ReviewMediaSummary | null;
    manga?: ReviewMediaSummary | null;
    reactions?: ReviewReaction[];
  }

  export interface GetReviewsResponse {
    tvShowReviews?: PaginatedResponse<Review>;
    movieReviews?: PaginatedResponse<Review>;
    gameReviews?: PaginatedResponse<Review>;
    animeReviews?: PaginatedResponse<Review>;
    bookReviews?: PaginatedResponse<Review>;
    mangaReviews?: PaginatedResponse<Review>;
  }

  export interface GameScreenshotGame {
    id: string;
    igdbId: number;
    name: string;
    coverUrl: string | null;
  }

  export type GameMediaType = "Image" | "Video";

  export type GameVideoProvider = "YouTube" | "Twitch";

  export interface GameScreenshot {
    id: string;
    url: string;
    type: GameMediaType;
    provider: GameVideoProvider | null;
    description: string | null;
    isSpoiler: boolean;
    userId: string;
    gameId: string;
    createdAt: string;
    game: GameScreenshotGame;
  }

  export interface GetGameScreenshotsResponse {
    screenshots: PaginatedResponse<GameScreenshot>;
  }

  export interface GameScreenshotResponse {
    screenshot: GameScreenshot;
  }

  export type ActivityType =
    | "AccountCreated"
    | "ListCreated"
    | "ListItemAdded"
    | "FavoriteAdded"
    | "ReviewAdded"
    | "ProgressStarted"
    | "ProgressCompleted"
    | "ProgressPaused"
    | "ProgressDropped"
    | "Watched"
    | "Followed"
    | "MedalEarned";

  export interface ActivityMediaSummary {
    id?: string;
    anilistId?: number | string | null;
    malId?: number | string | null;
    tmdbId?: number | string | null;
    igdbId?: number | string | null;
    hardcoverId?: number | string | null;
    name?: string | null;
    title?: string | null;
    coverUrl?: string | null;
    posterUrl?: string | null;
    imageUrl?: string | null;
  }

  export interface ActivityMediaRefs {
    anime?: ActivityMediaSummary | null;
    manga?: ActivityMediaSummary | null;
    tvShow?: ActivityMediaSummary | null;
    movie?: ActivityMediaSummary | null;
    game?: ActivityMediaSummary | null;
    book?: ActivityMediaSummary | null;
  }

  export interface ActivityUser {
    id: string;
    name: string;
    username: string;
    profile?: { avatarUrl: string | null } | null;
  }

  export interface ActivityReaction {
    id: string;
    emoji: string;
    createdAt: string;
    user: { id: string; username: string };
  }

  export interface ActivityReview extends ActivityMediaRefs {
    id: string;
    overall: number | string;
    story?: number | string | null;
    characters?: number | string | null;
    animation?: number | string | null;
    sound?: number | string | null;
    enjoyment?: number | string | null;
    art?: number | string | null;
    worldbuilding?: number | string | null;
    direction?: number | string | null;
    production?: number | string | null;
    acting?: number | string | null;
    graphics?: number | string | null;
    gameplay?: number | string | null;
    language?: number | string | null;
    theme?: number | string | null;
    summary?: string | null;
  }

  export interface ActivityProgress extends ActivityMediaRefs {
    id: string;
    status: string;
  }

  export interface ActivityEpisodeWatch extends ActivityMediaRefs {
    id: string;
    status: string;
    episode: number;
    season?: number;
  }

  export interface ActivityFavorite extends ActivityMediaRefs {
    id: string;
    type: string;
  }

  export interface ActivityListItem extends ActivityMediaRefs {
    id: string;
  }

  export interface Activity {
    id: string;
    type: ActivityType;
    userId: string;
    createdAt: string;
    metadata?: Record<string, unknown> | null;
    user: ActivityUser;
    reactions?: ActivityReaction[];
    _count?: { reactions: number };
    list?: { id: string; name: string } | null;
    listItem?: ActivityListItem | null;
    favorite?: ActivityFavorite | null;
    animeReview?: ActivityReview | null;
    mangaReview?: ActivityReview | null;
    tvShowReview?: ActivityReview | null;
    movieReview?: ActivityReview | null;
    gameReview?: ActivityReview | null;
    bookReview?: ActivityReview | null;
    animeProgress?: ActivityProgress | null;
    mangaProgress?: ActivityProgress | null;
    tvShowProgress?: ActivityProgress | null;
    movieProgress?: ActivityProgress | null;
    gameProgress?: ActivityProgress | null;
    bookProgress?: ActivityProgress | null;
    animeEpisodeWatch?: ActivityEpisodeWatch | null;
    tvShowEpisodeWatch?: ActivityEpisodeWatch | null;
    anime?: ActivityMediaSummary | null;
    tvShow?: ActivityMediaSummary | null;
    following?: { id: string; following: ActivityUser } | null;
    userMedal?: { id: string; medal: { id: string; name: string; imageUrl: string } } | null;
  }

  export interface ActivityGroup {
    type: ActivityType;
    userId: string;
    createdAt: string;
    count: number;
    items: Activity[];
  }

  export interface GetActivitiesByUserResponse {
    activities: PaginatedResponse<ActivityGroup>;
  }

  export interface ActivityCalendarItem {
    date: string;
    count: number;
  }

  export interface GetUserActivityCalendarResponse {
    activityCalendar: {
      total: number;
      items: ActivityCalendarItem[];
    };
  }

  export type WatchProviderOffer = "flatrate" | "free" | "ads" | "rent" | "buy";

  export interface WatchProvider {
    id: number;
    name: string;
    logoUrl: string | null;
    displayPriority: number | null;
  }

  export type WatchProviders = Record<WatchProviderOffer, WatchProvider[]> & {
    region: string;
    link: string | null;
    availableRegions: string[];
  };

  export interface WatchProviderRegion {
    code: string;
    name: string;
    nativeName: string;
  }

  export interface GetWatchProvidersResponse {
    watchProviders: WatchProviders;
  }

  export interface GetWatchProviderRegionsResponse {
    regions: WatchProviderRegion[];
  }
}

export const apiEndpoints = {
  getCurrency: "/stripe/currency",
  getPrices: "/stripe/price",
  getPerks: "/perk",
  getCurrentSubscription: "/stripe/subscription",
  cancelCurrentSubscription: "/stripe/subscription",
  createPayment: "/payment",
  getPayments: "/payment",
  getPaymentDetails: (id: string) => `/payment/detail/${id}`,
  updateUser: "/user",
  updateProfile: "/profile",
  updateProfileAvatar: "/profile/avatar",
  deleteProfileAvatar: "/profile/avatar",
  updateProfileBanner: "/profile/banner",
  deleteProfileBanner: "/profile/banner",
  uploadImage: "/upload/image",
  getGameDetails: (id: string) => `/game/detail/${id}`,
  getGameFranchise: (slug: string) => `/game/franchise/${slug}`,
  getGamePopular: "/game/top?filter=popular",
  getGameComing: "/game/top?filter=coming",
  getGameAnticipated: "/game/top?filter=antecipated",
  getGameRecentlyReleased: "/game/top?filter=recentlyReleased",
  gameScreenshot: "/game/screenshot",
  gameScreenshotById: (screenshotId: string) => `/game/screenshot/${screenshotId}`,
  gameReview: "/game/review",
  gameProgress: "/game/progress",
  getGameProgress: (userId: string, gameId: string) => `/game/progress?userId=${userId}&gameId=${gameId}`,
  resetGameTracking: (gameId: string) => `/game/tracking/${gameId}`,
  refreshGameData: "/game/refresh",
  getAnimeDetails: (id: string) => `/anime/detail/${id}`,
  getAnimeEpisodeDetails: (id: string) => `/anime/detail/${id}/episode`,
  getAnimeRelations: (id: string) => `/anime/detail/${id}/relation`,
  getAnimeAiring: "/anime/top?filter=airing",
  getAnimeRecommendations: "/anime/top?filter=bypopularity",
  getAnimeComingSoon: "/anime/top?filter=upcoming",
  getAnimeTop: "/anime/top?filter=favorite",
  animeReview: "/anime/review",
  animeProgress: "/anime/progress",
  getAnimeProgress: (userId: string, animeId: string) => `/anime/progress?userId=${userId}&animeId=${animeId}`,
  animeEpisodeWatch: "/anime/episode/watch",
  animeEpisodeWatchAll: "/anime/episode/watch/all",
  getAnimeEpisodeWatch: (userId: string, animeId: string) => `/anime/episode/watch?userId=${userId}&animeId=${animeId}`,
  refreshAnimeData: "/anime/refresh",
  getBookDetails: (id: string) => `/book/detail/${id}`,
  getBookFranchise: (slug: string) => `/book/franchise/${slug}`,
  getBookTrending: "/book/top?filter=trending",
  getBookComingSoon: "/book/top?filter=comingSoon",
  bookReview: "/book/review",
  bookProgress: "/book/progress",
  getBookProgress: (userId: string, bookId: string) => `/book/progress?userId=${userId}&bookId=${bookId}`,
  refreshBookData: "/book/refresh",
  getPerson: (slug: string) => `/person/${slug}`,
  getMangaCast: (slug: string) => `/manga/cast/${slug}`,
  getMovieCompany: (slug: string) => `/movie/company/${slug}`,
  getTvShowCompany: (slug: string) => `/tv/company/${slug}`,
  getAnimeCompany: (slug: string) => `/anime/company/${slug}`,
  getGameCompany: (slug: string) => `/game/company/${slug}`,
  getMovieDetails: (id: string) => `/movie/detail/${id}`,
  getMovieWatchProviders: (id: string) => `/movie/detail/${id}/watch/provider`,
  getWatchProviderRegions: "/movie/watch/provider/region",
  getMovieFranchise: (slug: string) => `/movie/franchise/${slug}`,
  getMovieAiring: "/movie/top?filter=airing",
  getMovieUpcoming: "/movie/top?filter=upcoming",
  getMovieTrending: "/movie/top?filter=trending",
  getMoviePopular: "/movie/top?filter=popular",
  movieReview: "/movie/review",
  movieProgress: "/movie/progress",
  getMovieProgress: (userId: string, movieId: string) => `/movie/progress?userId=${userId}&movieId=${movieId}`,
  refreshMovieData: "/movie/refresh",
  getTvShowDetails: (id: string) => `/tv/detail/${id}`,
  getTvShowWatchProviders: (id: string) => `/tv/detail/${id}/watch/provider`,
  getTvShowSeasonDetails: (id: string) => `/tv/detail/${id}/season`,
  getTvShowSeasonEpisodes: (id: string, seasonNumber: number) => `/tv/detail/${id}/season/${seasonNumber}/episode`,
  getTvShowAiring: "/tv/top?filter=airing",
  getTvShowUpcoming: "/tv/top?filter=upcoming",
  getTvShowTrending: "/tv/top?filter=trending",
  getTvShowPopular: "/tv/top?filter=popular",
  tvShowReview: "/tv/review",
  refreshTvShowData: "/tv/refresh",
  tvShowEpisodeWatch: "/tv/episode/watch",
  tvShowEpisodeWatchAll: "/tv/episode/watch/all",
  getTvShowEpisodeWatch: (userId: string, tvShowId: string) =>
    `/tv/episode/watch?userId=${userId}&tvShowId=${tvShowId}`,
  tvShowProgress: "/tv/progress",
  getTvShowProgress: (userId: string, tvShowId: string) => `/tv/progress?userId=${userId}&tvShowId=${tvShowId}`,
  resetTvShowTracking: (tvShowId: string) => `/tv/tracking/${tvShowId}`,
  getMangaDetails: (id: string) => `/manga/detail/${id}`,
  getMangaPublishing: "/manga/top?filter=publishing",
  getMangaUpcoming: "/manga/top?filter=upcoming",
  getMangaFavorite: "/manga/top?filter=favorite",
  getMangaRecommendations: "/manga/top?filter=bypopularity",
  mangaReview: "/manga/review",
  mangaProgress: "/manga/progress",
  getMangaProgress: (userId: string, mangaId: string) => `/manga/progress?userId=${userId}&mangaId=${mangaId}`,
  refreshMangaData: "/manga/refresh",
  list: "/list",
  getListsByUserId: (userId: string) => `/list/user/${userId}`,
  getListStatus: "/list/status",
  getListsContainingItem: "/list/containing",
  listItem: (listId: string) => `/list/${listId}/item`,
  getItemsByListId: (listId: string) => `/list/${listId}/item`,
  updateList: (listId: string) => `/list/${listId}`,
  deleteList: (listId: string) => `/list/${listId}`,
  getUserByUsername: (username: string) => `/user/username/${username}`,
  searchUsers: "/user/search",
  followUser: (followId: string) => `/user/follow/${followId}`,
  unfollowUser: (unfollowId: string) => `/user/unfollow/${unfollowId}`,
  getFollowers: "/user/follower",
  getFollowing: "/user/following",
  getFollowStatus: (username: string) => `/user/follow-status/${username}`,
  getComments: "/comment",
  addComment: "/comment",
  deleteComment: (commentId: string) => `/comment/${commentId}`,
  getFavoritesByUserId: (userId: string) => `/favorite/user/${userId}`,
  getFavoriteStatus: "/favorite/status",
  addFavorite: "/favorite",
  removeFavorite: "/favorite",
  addReaction: "/reaction",
  deleteReaction: (reactionId: string) => `/reaction/${reactionId}`,
  getActivities: "/activities/global",
  getActivitiesFollowing: "/activities/following",
  getActivitiesTrending: "/activities/trending",
  getActivitiesByUserId: (userId: string) => `/activities/user/${userId}`,
  getCalendarActivitiesByUserId: (userId: string) => `/activities/user/${userId}/calendar`,
  getNotifications: "/notifications",
  getUnreadNotificationsCount: "/notifications/unread/count",
  getNotificationPreferences: "/notifications/preferences",
  updateNotificationPreferences: "/notifications/preferences",
  markAllNotificationsAsRead: "/notifications/read/all",
  markAllNotificationsAsUnread: "/notifications/read/all",
  deleteAllNotifications: "/notifications/all",
  markNotificationAsRead: (notificationId: string) => `/notifications/${notificationId}/read`,
  markNotificationAsUnread: (notificationId: string) => `/notifications/${notificationId}/read`,
  deleteNotification: (notificationId: string) => `/notifications/${notificationId}`,
};
