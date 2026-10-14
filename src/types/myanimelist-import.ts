import type { ImportEntry } from "@/lib/import/shared";

interface MalBaseEntry extends ImportEntry {
  malId: string;
  startedAt?: string;
  completedAt?: string;
  rating?: number;
}

export type MalEntry = MalBaseEntry &
  (
    | { mediaType: "anime"; watchedEpisodes: number; watchCount?: number }
    | { mediaType: "manga"; chaptersRead: number; readCount: number }
  );
