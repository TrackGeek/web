export const TOUR_STORAGE_KEY = "trackgeek.tour";

export const TOUR_NEW_ACCOUNT_WINDOW = 1000 * 60 * 60 * 24 * 3;

export type TourStage = "welcome" | "feed" | "profile" | "search" | "details";

export type TourState = TourStage | "done";

export interface TourStepConfig {
  id: string;
  selector?: string;
  side?: "top" | "right" | "bottom" | "left";
}

export interface TourStageConfig {
  matches: (pathname: string, username?: string | null) => boolean;
  waitFor?: string;
  steps: TourStepConfig[];
}

export const TOUR_STAGES: Record<TourStage, TourStageConfig> = {
  welcome: {
    matches: () => true,
    steps: [{ id: "welcome" }],
  },
  feed: {
    matches: (pathname) => pathname.replace(/\/$/, "") === "/feed",
    waitFor: '[data-tour="feed-tabs"]',
    steps: [
      { id: "tabs", selector: '[data-tour="feed-tabs"]', side: "bottom" },
      { id: "composer", selector: '[data-tour="feed-composer"]', side: "bottom" },
      { id: "sidebar", selector: '[data-tour="feed-sidebar"]', side: "left" },
      { id: "userMenu", selector: '[data-tour="user-menu"]', side: "bottom" },
    ],
  },
  profile: {
    matches: (pathname, username) => !!username && pathname.replace(/\/$/, "") === `/user/${username}`,
    waitFor: '[data-tour="profile-tabs"]',
    steps: [
      { id: "tabs", selector: '[data-tour="profile-tabs"]', side: "bottom" },
      { id: "stats", selector: '[data-tour="profile-stats"]', side: "bottom" },
      { id: "sections", selector: '[data-tour="progress-sections"]', side: "right" },
      { id: "filters", selector: '[data-tour="progress-filters"]', side: "right" },
      { id: "xp", selector: '[data-tour="profile-xp"]', side: "left" },
    ],
  },
  search: {
    matches: (pathname) => pathname.replace(/\/$/, "") === "/search",
    waitFor: '[data-tour="search-input"]',
    steps: [
      { id: "type", selector: '[data-tour="search-type"]', side: "bottom" },
      { id: "input", selector: '[data-tour="search-input"]', side: "bottom" },
    ],
  },
  details: {
    matches: (pathname) => /^\/(movie|tv|anime|manga|game|book)\/[^/]+\/?$/.test(pathname),
    waitFor: '[data-tour="status-buttons"]',
    steps: [
      { id: "status", selector: '[data-tour="status-buttons"]', side: "top" },
      { id: "userMenu", selector: '[data-tour="user-menu"]', side: "bottom" },
    ],
  },
};
