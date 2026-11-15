import type { ContentTypeSlug } from "@/lib/content-types";

export const REWIND_YEAR = 2026;

export const REWIND_THEME: Record<ContentTypeSlug, string> = {
  movie: "bg-replay-yellow text-replay-ink",
  tv: "bg-replay-blue text-replay-paper",
  anime: "bg-replay-pink text-replay-ink",
  game: "bg-replay-orange text-replay-ink",
  manga: "bg-replay-mint text-replay-ink",
  book: "bg-replay-paper text-replay-ink",
};

export const REWIND_CHORDS = [
  [130.81, 164.81, 196, 246.94],
  [146.83, 174.61, 220, 261.63],
  [164.81, 196, 246.94, 293.66],
  [130.81, 174.61, 220, 261.63],
  [146.83, 196, 246.94, 293.66],
  [164.81, 220, 261.63, 329.63],
  [130.81, 164.81, 220, 293.66],
  [174.61, 220, 261.63, 329.63],
] as const;
