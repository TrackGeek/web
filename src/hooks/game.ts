import { useMutation, useQuery } from "@tanstack/react-query";
import { api, apiEndpoints } from "@/lib/api.ts";

interface GameProgress {
  hoursPlayed: number;
  status: string | null;
  completionStatus: string | null;
  replays: number;
  startDate: string | null;
  finishDate: string | null;
}

interface GameReviewScreenshot {
  gameReviewId: string;
  isSpoiler: boolean;
  url: string;
  description?: string;
}

interface GameReviewPayload {
  gameId: string;
  userId: string;
  overall: number;
  gameplay?: number;
  graphics?: number;
  sound?: number;
  story?: number;
  notes?: string;
  platform?: string;
  recommended?: boolean;
  summary?: string;
  screenshots?: GameReviewScreenshot[];
}

export function useGameProgress(userId: string | undefined, gameId: string | undefined) {
  return useQuery<GameProgress>({
    queryKey: ["game-progress", userId, gameId],
    queryFn: async () => {
      const { data } = await api.get(apiEndpoints.gameProgress, {
        params: { userId, gameId },
      });
      return data;
    },
    enabled: !!userId && !!gameId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGameReview() {
  return useMutation({
    mutationFn: async (payload: GameReviewPayload) => {
      const { data } = await api.post(apiEndpoints.gameReview, payload);
      return data;
    },
  });
}

export function useGameScreenshot() {
  return useMutation({
    mutationFn: async (payload: GameReviewScreenshot) => {
      const { data } = await api.post(apiEndpoints.gameReviewScreenshot, payload);
      return data;
    },
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post<{ imageUrl: string }>(apiEndpoints.uploadImage, formData);
      return data.imageUrl;
    },
  });
}
