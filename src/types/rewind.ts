import type { ContentTypeSlug } from "@/lib/content-types";

export interface RewindTitle {
  id: string;
  title: string | null;
  image: string | null;
  slug: string | null;
  recordedAt: string;
  completed?: boolean;
}

export interface RewindCategory {
  type: ContentTypeSlug;
  tracked: number;
  completed: number;
  titles: (RewindTitle & { overall: number; favorite: boolean })[];
}

export interface PersonalRewind {
  reviewFavoriteBonus: number;
  year: number;
  startsAt: string;
  endsAt: string;
  launchAt: string;
  generatedAt: string;
  isPreview: boolean;
  tracked: number;
  completed: number;
  categories: RewindCategory[];
  monthly: { month: number; count: number }[];
  first: (RewindTitle & { type: ContentTypeSlug }) | null;
}

export interface GlobalRewind {
  year: number;
  launchAt: string;
  generatedAt: string;
  isPreview: boolean;
  people: number;
  tracked: number;
  completed: number;
  categories: { type: ContentTypeSlug; tracked: number; completed: number; people: number }[];
}

export type RewindScene =
  | { id: "intro"; kind: "intro" }
  | { id: "overview"; kind: "overview" }
  | { id: "first"; kind: "first" }
  | { id: "rhythm"; kind: "rhythm" }
  | { id: string; kind: "category" | "shelf"; category: RewindCategory }
  | { id: "global"; kind: "global" }
  | { id: "outro"; kind: "outro" };
