import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

const SCREENSHOTS_PER_PAGE = 20;

const SCREENSHOT_MAX_SIZE = 1024 * 1024 * 5;

const SCREENSHOT_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp)$/i;

interface GameProgress {
  hoursPlayed: number;
  status: string | null;
  completionStatus: string | null;
  replays: number;
  startDate: string | null;
  finishDate: string | null;
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
}

interface GameScreenshotsFilters {
  userId?: string;
  gameId?: string;
}

interface CreateGameScreenshotPayload {
  gameId: string;
  url: string;
  type?: ApiTypes.GameMediaType;
  description?: string;
  isSpoiler?: boolean;
}

interface UpdateGameScreenshotPayload {
  screenshotId: string;
  description?: string;
  isSpoiler?: boolean;
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

export function validateScreenshotFile(file: File): string | null {
  if (!SCREENSHOT_EXTENSIONS.test(file.name)) return "feed:screenshotTypeInvalid";
  if (file.size > SCREENSHOT_MAX_SIZE) return "feed:screenshotTooLarge";
  return null;
}

export function gameScreenshotsQueryKey({ userId, gameId }: GameScreenshotsFilters) {
  return ["game-screenshots", userId ?? null, gameId ?? null];
}

export function useGameScreenshots({ userId, gameId }: GameScreenshotsFilters) {
  return useInfiniteQuery({
    queryKey: gameScreenshotsQueryKey({ userId, gameId }),
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.GetGameScreenshotsResponse>(`${apiEndpoints.gameScreenshot}/`, {
          params: {
            ...(userId && { userId }),
            ...(gameId && { gameId }),
            page: pageParam,
            itemsPerPage: SCREENSHOTS_PER_PAGE,
          },
        })
        .then(({ data }) => data.screenshots),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined),
    enabled: !!userId || !!gameId,
  });
}

function useInvalidateGameScreenshots() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: ["game-screenshots"] });
}

export function useCreateGameScreenshot() {
  const invalidate = useInvalidateGameScreenshots();

  return useMutation({
    mutationFn: async (payload: CreateGameScreenshotPayload) => {
      const { data } = await api.post<ApiTypes.GameScreenshotResponse>(apiEndpoints.gameScreenshot, payload);
      return data.screenshot;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateGameScreenshot() {
  const invalidate = useInvalidateGameScreenshots();

  return useMutation({
    mutationFn: async ({ screenshotId, ...payload }: UpdateGameScreenshotPayload) => {
      const { data } = await api.patch<ApiTypes.GameScreenshotResponse>(
        apiEndpoints.gameScreenshotById(screenshotId),
        payload,
      );
      return data.screenshot;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteGameScreenshot() {
  const invalidate = useInvalidateGameScreenshots();

  return useMutation({
    mutationFn: (screenshotId: string) => api.delete(apiEndpoints.gameScreenshotById(screenshotId)),
    onSuccess: invalidate,
  });
}
