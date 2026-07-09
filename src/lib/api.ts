import axios from "axios";
import { DEFAULT_LANGUAGE, LANGUAGE_TOKEN } from "./i18n/config";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "X-TrackGeek-Language": window?.localStorage?.getItem(LANGUAGE_TOKEN) ?? DEFAULT_LANGUAGE,
    "X-TrackGeek-Version": "1.0.0",
  },
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
    };
    latestReviewType: ReviewContentType | null;
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

  export type CommentType = "Anime" | "Manga" | "TVShow" | "Movie" | "Game" | "Book" | "Profile";

  export interface CommentReaction {
    id: string;
    emoji: string;
    createdAt: string;
    user: {
      username: string;
    };
  }

  export interface Comment {
    id: string;
    content: string;
    type: CommentType;
    userId: string;
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
    | "ReactionOnBookReview";

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
  }

  export interface GetNotificationsResponse {
    notifications: PaginatedResponse<Notification>;
  }

  export interface GetUnreadNotificationsCountResponse {
    count: number;
  }

  export type FavoriteType = "Anime" | "Manga" | "TVShow" | "Movie" | "Game" | "Book";

  export interface Favorite {
    id: string;
    type: FavoriteType;
    createdAt: string;
    anime: { id: string; malId: number; title: string; imageUrl: string | null } | null;
    manga: { id: string; malId: number; title: string; imageUrl: string | null } | null;
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
    manga: { id: string; malId: number; title: string; imageUrl: string | null } | null;
    tvShow: { id: string; tmdbId: number; name: string; backdropUrl: string | null } | null;
    movie: { id: string; tmdbId: number; title: string; backdropUrl: string | null } | null;
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
    backdropUrl?: string | null;
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

  export type ActivityType =
    | "AccountCreated"
    | "ListCreated"
    | "ListItemAdded"
    | "FavoriteAdded"
    | "ReviewAdded"
    | "ProgressStarted"
    | "ProgressCompleted"
    | "Watched"
    | "Followed"
    | "MedalEarned";

  export interface ActivityMediaSummary {
    id?: string;
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
  getGamePopular: "/game/top?filter=popular",
  getGameComing: "/game/top?filter=coming",
  getGameAnticipated: "/game/top?filter=anticipated",
  getGameRecentlyReleased: "/game/top?filter=recentlyReleased",
  gameReviewScreenshot: "/game/review/screenshot",
  gameReview: "/game/review",
  gameProgress: "/game/progress",
  refreshGameData: "/game/refresh",
  getAnimeDetails: (id: string) => `/anime/detail/${id}`,
  getAnimeEpisodeDetails: (id: string) => `/anime/detail/${id}/episode`,
  getAnimeAiring: "/anime/top?filter=airing",
  getAnimeRecommendations: "/anime/top?filter=bypopularity",
  getAnimeComingSoon: "/anime/top?filter=upcoming",
  getAnimeTop: "/anime/top?filter=favorite",
  animeReview: "/anime/review",
  refreshAnimeData: "/anime/refresh",
  getBookDetails: (id: string) => `/book/detail/${id}`,
  getBookTrending: "/book/top?filter=trending",
  getBookComingSoon: "/book/top?filter=comingSoon",
  bookReview: "/book/review",
  refreshBookData: "/book/refresh",
  getMovieDetails: (id: string) => `/movie/detail/${id}`,
  getMovieAiring: "/movie/top?filter=airing",
  getMovieUpcoming: "/movie/top?filter=upcoming",
  getMovieTrending: "/movie/top?filter=trending",
  getMoviePopular: "/movie/top?filter=popular",
  movieReview: "/movie/review",
  refreshMovieData: "/movie/refresh",
  getTvShowDetails: (id: string) => `/tv/detail/${id}`,
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
  getActivitiesByUserId: (userId: string) => `/activities/user/${userId}`,
  getCalendarActivitiesByUserId: (userId: string) => `/activities/user/${userId}/calendar`,
  getNotifications: "/notifications",
  getUnreadNotificationsCount: "/notifications/unread/count",
  markAllNotificationsAsRead: "/notifications/read/all",
  markAllNotificationsAsUnread: "/notifications/read/all",
  deleteAllNotifications: "/notifications/all",
  markNotificationAsRead: (notificationId: string) => `/notifications/${notificationId}/read`,
  markNotificationAsUnread: (notificationId: string) => `/notifications/${notificationId}/read`,
  deleteNotification: (notificationId: string) => `/notifications/${notificationId}`,
};
