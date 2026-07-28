import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import type { TFunction } from "i18next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";
import { useSession } from "@/lib/auth.ts";
import { Button } from "../../ui/button";
import { Calendar } from "../../ui/calendar";
import { Checkbox } from "../../ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Field, FieldError, FieldLabel } from "../../ui/field";
import { Input } from "../../ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "../../ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { RatingGroupAdvanced } from "../../ui/rating-group-advanced";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";

type ProgressStatus = "Planning" | "Watching" | "Completed" | "Paused" | "Dropped";

const STATUS_OPTIONS = ["planning", "watching", "completed", "rewatching", "dropped", "paused"] as const;

const STATUS_TO_ENUM: Record<string, ProgressStatus> = {
  planning: "Planning",
  watching: "Watching",
  completed: "Completed",
  rewatching: "Watching",
  dropped: "Dropped",
  paused: "Paused",
};

const ENUM_TO_STATUS: Record<ProgressStatus, string> = {
  Planning: "planning",
  Watching: "watching",
  Completed: "completed",
  Paused: "paused",
  Dropped: "dropped",
};

const SUMMARY_MAX_LENGTH = 500;
const STORY_MAX_LENGTH = 500;
const REVIEW_NOTES_MAX_LENGTH = 1000;
const PROGRESS_NOTES_MAX_LENGTH = 1000;

function createProgressSchema(t: TFunction) {
  return z.object({
    status: z.string(),
    watchCount: z.string(),
    startDate: z.date().optional(),
    finishDate: z.date().optional(),
    notes: z.string().trim().max(PROGRESS_NOTES_MAX_LENGTH, t("feed:progress.errors.notesMax")),
  });
}

type ProgressFormData = z.infer<ReturnType<typeof createProgressSchema>>;

function createReviewSchema(t: TFunction) {
  return z.object({
    overall: z.string(),
    direction: z.string(),
    production: z.string(),
    acting: z.string(),
    story: z.string(),
    characters: z.string(),
    animation: z.string(),
    sound: z.string(),
    enjoyment: z.string(),
    summary: z.string().trim().max(SUMMARY_MAX_LENGTH, t("feed:review.errors.summaryMax")),
    notes: z.string().trim().max(REVIEW_NOTES_MAX_LENGTH, t("feed:review.errors.notesMax")),
    storyText: z.string().trim().max(STORY_MAX_LENGTH, t("feed:review.errors.storyMax")),
    recommended: z.boolean(),
  });
}

type ReviewFormData = z.infer<ReturnType<typeof createReviewSchema>>;

const DEFAULT_REVIEW_VALUES: ReviewFormData = {
  overall: "0",
  direction: "0",
  production: "0",
  acting: "0",
  story: "0",
  characters: "0",
  animation: "0",
  sound: "0",
  enjoyment: "0",
  summary: "",
  notes: "",
  storyText: "",
  recommended: false,
};

type MediaType = "tv" | "anime";

interface ReviewCriterion {
  name: keyof ReviewFormData;
  labelKey: string;
}

interface MediaConfig {
  idKey: "tvShowId" | "animeId";
  listType: "TVShow" | "Anime";
  hasSeasons: boolean;
  hasProgressNotes: boolean;
  hasStoryText: boolean;
  progressEndpoint: string;
  getProgress: (userId: string, id: string) => string;
  progressResponseKey: "tvShowProgresses" | "animeProgresses";
  reviewEndpoint: string;
  reviewsResponseKey: "tvShowReviews" | "animeReviews";
  episodeWatchEndpoint: string;
  episodeWatchAllEndpoint: string;
  getEpisodeWatch: (userId: string, id: string) => string;
  episodeWatchResponseKey: "tvShowEpisodeWatch" | "animeEpisodeWatch";
  reviewCriteria: ReviewCriterion[];
  keys: {
    progress: string;
    review: string;
    reviews: string;
    episodeWatch: string;
    lists: string;
    listStatus: string;
    containingLists: string;
    root: string;
  };
}

const MEDIA_CONFIG: Record<MediaType, MediaConfig> = {
  tv: {
    idKey: "tvShowId",
    listType: "TVShow",
    hasSeasons: true,
    hasProgressNotes: true,
    hasStoryText: true,
    progressEndpoint: apiEndpoints.tvShowProgress,
    getProgress: apiEndpoints.getTvShowProgress,
    progressResponseKey: "tvShowProgresses",
    reviewEndpoint: apiEndpoints.tvShowReview,
    reviewsResponseKey: "tvShowReviews",
    episodeWatchEndpoint: apiEndpoints.tvShowEpisodeWatch,
    episodeWatchAllEndpoint: apiEndpoints.tvShowEpisodeWatchAll,
    getEpisodeWatch: apiEndpoints.getTvShowEpisodeWatch,
    episodeWatchResponseKey: "tvShowEpisodeWatch",
    reviewCriteria: [
      { name: "direction", labelKey: "feed:criteries.direction" },
      { name: "production", labelKey: "feed:criteries.production" },
      { name: "acting", labelKey: "feed:criteries.acting" },
    ],
    keys: {
      progress: "tvProgress",
      review: "tvReview",
      reviews: "tvReviews",
      episodeWatch: "tvEpisodeWatch",
      lists: "tvLists",
      listStatus: "tvListStatus",
      containingLists: "tvContainingLists",
      root: "tv",
    },
  },
  anime: {
    idKey: "animeId",
    listType: "Anime",
    hasSeasons: false,
    hasProgressNotes: false,
    hasStoryText: false,
    progressEndpoint: apiEndpoints.animeProgress,
    getProgress: apiEndpoints.getAnimeProgress,
    progressResponseKey: "animeProgresses",
    reviewEndpoint: apiEndpoints.animeReview,
    reviewsResponseKey: "animeReviews",
    episodeWatchEndpoint: apiEndpoints.animeEpisodeWatch,
    episodeWatchAllEndpoint: apiEndpoints.animeEpisodeWatchAll,
    getEpisodeWatch: apiEndpoints.getAnimeEpisodeWatch,
    episodeWatchResponseKey: "animeEpisodeWatch",
    reviewCriteria: [
      { name: "story", labelKey: "feed:criteries.story" },
      { name: "characters", labelKey: "feed:criteries.characters" },
      { name: "animation", labelKey: "feed:criteries.animation" },
      { name: "sound", labelKey: "feed:criteries.soundtrack" },
      { name: "enjoyment", labelKey: "feed:criteries.enjoyment" },
    ],
    keys: {
      progress: "animeProgress",
      review: "animeReview",
      reviews: "animeReviews",
      episodeWatch: "animeEpisodeWatch",
      lists: "animeLists",
      listStatus: "animeListStatus",
      containingLists: "animeContainingLists",
      root: "anime",
    },
  },
};

interface MediaProgressData {
  id: string;
  status: ProgressStatus;
  watchCount: number | null;
  notes: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

interface MediaReviewData {
  id: string;
  overall: number | string;
  direction?: number | string | null;
  production?: number | string | null;
  acting?: number | string | null;
  story?: number | string | null;
  characters?: number | string | null;
  animation?: number | string | null;
  sound?: number | string | null;
  enjoyment?: number | string | null;
  summary: string | null;
  notes: string | null;
  recommended: boolean | null;
}

interface EpisodicContentModalProps {
  mediaType?: MediaType;
  tvShowId?: string;
  animeId?: string;
  slug?: string;
  totalEpisodes?: number;
  watchedEpisodes?: number;
  onClose?: () => void;
}

interface SeasonDetails {
  seasonNumber: number;
  numberOfEpisodes: number;
}

interface EpisodeWatch {
  season?: number;
  episode: number;
  status: string;
}

interface OrderedEpisode {
  season?: number;
  episode: number;
}

export function EpisodicContentModal({
  mediaType = "tv",
  tvShowId,
  animeId,
  slug,
  totalEpisodes = 0,
  watchedEpisodes = 0,
  onClose,
}: EpisodicContentModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const session = useSession();
  const userId = session?.data?.user?.id;

  const cfg = MEDIA_CONFIG[mediaType];
  const mediaId = mediaType === "anime" ? animeId : tvShowId;
  const enabled = !!userId && !!mediaId;

  const episodeKey = useCallback(
    (season: number | undefined, episode: number) => (cfg.hasSeasons ? `${season}-${episode}` : `${episode}`),
    [cfg.hasSeasons],
  );

  const progressSchema = useMemo(() => createProgressSchema(t), [t]);

  const progressForm = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      status: "",
      watchCount: "",
      startDate: undefined,
      finishDate: undefined,
      notes: "",
    },
  });

  const progressStatus = progressForm.watch("status");
  const progressNotes = progressForm.watch("notes") ?? "";

  const reviewSchema = useMemo(() => createReviewSchema(t), [t]);

  const reviewForm = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: DEFAULT_REVIEW_VALUES,
  });

  const summary = reviewForm.watch("summary") ?? "";
  const storyText = reviewForm.watch("storyText") ?? "";
  const reviewNotes = reviewForm.watch("notes") ?? "";

  const [newListInput, setNewListInput] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const progressQuery = useQuery<MediaProgressData | null>({
    queryKey: [cfg.keys.progress, mediaId, userId],
    queryFn: () =>
      api
        .get(cfg.getProgress(userId as string, mediaId as string))
        .then(({ data }) => data[cfg.progressResponseKey].items[0] ?? null),
    enabled,
  });

  const reviewQuery = useQuery<MediaReviewData | null>({
    queryKey: [cfg.keys.review, mediaId, userId],
    queryFn: () =>
      api
        .get(`${cfg.reviewEndpoint}/?${cfg.idKey}=${mediaId}&userId=${userId}`)
        .then(({ data }) => data[cfg.reviewsResponseKey].items[0] ?? null),
    enabled,
  });

  const listsQuery = useQuery<ApiTypes.List[]>({
    queryKey: [cfg.keys.lists, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListsByUserIdResponse>(apiEndpoints.getListsByUserId(userId as string), {
          params: { type: cfg.listType, itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists.items),
    enabled,
  });

  const lists = listsQuery.data ?? [];

  const listStatusQuery = useQuery<string[]>({
    queryKey: [cfg.keys.listStatus, mediaId, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListStatusResponse>(apiEndpoints.getListStatus, {
          params: { type: cfg.listType, [cfg.idKey]: mediaId },
        })
        .then(({ data }) => data.listIds),
    enabled,
  });

  const listIds = listStatusQuery.data ?? [];

  const isInList = (listId: string) => listIds.includes(listId);

  const seasonsQuery = useQuery<SeasonDetails[]>({
    queryKey: ["tvSeason", slug],
    queryFn: () => api.get(apiEndpoints.getTvShowSeasonDetails(slug as string)).then(({ data }) => data.seasons),
    enabled: cfg.hasSeasons && !!slug,
  });

  const episodeWatchQuery = useQuery<EpisodeWatch[]>({
    queryKey: [cfg.keys.episodeWatch, mediaId, userId],
    queryFn: () =>
      api
        .get(cfg.getEpisodeWatch(userId as string, mediaId as string))
        .then(({ data }) => data[cfg.episodeWatchResponseKey]),
    enabled,
  });

  const orderedEpisodes = useMemo<OrderedEpisode[]>(() => {
    if (!cfg.hasSeasons) {
      return Array.from({ length: totalEpisodes }, (_, i) => ({ episode: i + 1 }));
    }

    return (seasonsQuery.data ?? [])
      .filter((season) => season.numberOfEpisodes > 0 && season.seasonNumber > 0)
      .sort((a, b) => a.seasonNumber - b.seasonNumber)
      .flatMap((season) =>
        Array.from({ length: season.numberOfEpisodes }, (_, i) => ({ season: season.seasonNumber, episode: i + 1 })),
      );
  }, [cfg.hasSeasons, seasonsQuery.data, totalEpisodes]);

  const watchedSet = useMemo(() => {
    const set = new Set<string>();
    for (const watch of episodeWatchQuery.data ?? []) {
      if (watch.status === "Completed") set.add(episodeKey(watch.season, watch.episode));
    }
    return set;
  }, [episodeWatchQuery.data, episodeKey]);

  const [episodeInput, setEpisodeInput] = useState(String(watchedEpisodes));

  useEffect(() => {
    setEpisodeInput(String(watchedEpisodes));
  }, [watchedEpisodes]);

  const setEpisodesMutation = useMutation({
    mutationFn: async (target: number) => {
      const clamped = Math.max(0, Math.min(target, orderedEpisodes.length));

      const toAdd = orderedEpisodes.slice(0, clamped).filter((e) => !watchedSet.has(episodeKey(e.season, e.episode)));
      const toRemove = orderedEpisodes.slice(clamped).filter((e) => watchedSet.has(episodeKey(e.season, e.episode)));

      if (toAdd.length > 0) {
        await api.post(cfg.episodeWatchEndpoint, {
          [cfg.idKey]: mediaId,
          episodes: toAdd.map((e) =>
            cfg.hasSeasons
              ? { season: e.season, episode: e.episode, status: "Completed" }
              : { episode: e.episode, status: "Completed" },
          ),
        });
      }

      await Promise.all(
        toRemove.map((e) =>
          api.delete(cfg.episodeWatchEndpoint, {
            data: cfg.hasSeasons
              ? { [cfg.idKey]: mediaId, season: e.season, episode: e.episode }
              : { [cfg.idKey]: mediaId, episode: e.episode },
          }),
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [cfg.keys.episodeWatch, mediaId, userId] });
      queryClient.invalidateQueries({ queryKey: [cfg.keys.progress, mediaId, userId] });
      queryClient.invalidateQueries({ queryKey: [cfg.keys.root] });
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const commitEpisodeCount = () => {
    if (orderedEpisodes.length === 0) return;

    const parsed = Number.parseInt(episodeInput, 10);
    const next = Math.max(0, Math.min(Number.isNaN(parsed) ? 0 : parsed, orderedEpisodes.length));

    setEpisodeInput(String(next));

    if (next !== watchedEpisodes) {
      setEpisodesMutation.mutate(next);
    }
  };

  useEffect(() => {
    const progress = progressQuery.data;
    if (!progress) return;

    progressForm.reset({
      status: ENUM_TO_STATUS[progress.status] ?? "",
      watchCount: progress.watchCount != null ? String(progress.watchCount) : "",
      notes: progress.notes ?? "",
      startDate: progress.startedAt ? new Date(progress.startedAt) : undefined,
      finishDate: progress.completedAt ? new Date(progress.completedAt) : undefined,
    });
  }, [progressQuery.data, progressForm.reset]);

  useEffect(() => {
    const review = reviewQuery.data;
    if (!review) return;

    const values: ReviewFormData = {
      ...DEFAULT_REVIEW_VALUES,
      overall: String(Number(review.overall)),
      summary: review.summary ?? "",
      notes: review.notes ?? "",
      recommended: !!review.recommended,
    };

    for (const criterion of cfg.reviewCriteria) {
      const raw = review[criterion.name as keyof MediaReviewData];
      values[criterion.name] = raw != null ? String(Number(raw)) : "0";
    }

    if (cfg.hasStoryText) {
      values.storyText = (review.story as string | null) ?? "";
    }

    reviewForm.reset(values);
  }, [reviewQuery.data, reviewForm.reset, cfg.hasStoryText, cfg.reviewCriteria]);

  const invalidateProgress = () => {
    queryClient.invalidateQueries({ queryKey: [cfg.keys.progress, mediaId, userId] });
    queryClient.invalidateQueries({ queryKey: [cfg.keys.episodeWatch, mediaId, userId] });
    queryClient.invalidateQueries({ queryKey: [cfg.keys.root] });
  };

  const saveProgressMutation = useMutation({
    mutationFn: (data: ProgressFormData) => {
      const status = STATUS_TO_ENUM[data.status];

      const body: Record<string, unknown> = {
        [cfg.idKey]: mediaId,
        status,
        watchCount: data.watchCount ? Number(data.watchCount) : undefined,
        startedAt: data.startDate ?? undefined,
        completedAt: status === "Completed" ? (data.finishDate ?? new Date()) : (data.finishDate ?? undefined),
      };

      if (cfg.hasProgressNotes) {
        body.notes = data.notes.trim() || undefined;
      }

      return api.post(cfg.progressEndpoint, body);
    },
    onSuccess: invalidateProgress,
  });

  const saveReviewMutation = useMutation({
    mutationFn: (data: ReviewFormData) => {
      const body: Record<string, unknown> = {
        [cfg.idKey]: mediaId,
        overall: Number(data.overall),
        summary: data.summary.trim() || undefined,
        notes: data.notes.trim() || undefined,
        recommended: data.recommended,
      };

      for (const criterion of cfg.reviewCriteria) {
        body[criterion.name] = Number(data[criterion.name]) || undefined;
      }

      if (cfg.hasStoryText) {
        body.story = data.storyText.trim() || undefined;
      }

      const existing = reviewQuery.data;

      return existing ? api.patch(`${cfg.reviewEndpoint}/${existing.id}`, body) : api.post(cfg.reviewEndpoint, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [cfg.keys.review, mediaId, userId] });
      queryClient.invalidateQueries({ queryKey: [cfg.keys.reviews, mediaId] });
      queryClient.invalidateQueries({ queryKey: [cfg.keys.root] });
    },
  });

  const deleteProgressMutation = useMutation({
    mutationFn: async () => {
      if (mediaType === "tv") {
        return api.delete(apiEndpoints.resetTvShowTracking(mediaId as string));
      }

      const ops: Promise<unknown>[] = [api.delete(cfg.episodeWatchAllEndpoint, { data: { [cfg.idKey]: mediaId } })];

      if (progressQuery.data) {
        ops.push(api.delete(`${cfg.progressEndpoint}/${progressQuery.data.id}`));
      }

      if (reviewQuery.data) {
        ops.push(api.delete(`${cfg.reviewEndpoint}/${reviewQuery.data.id}`));
      }

      await Promise.all(ops);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [cfg.keys.progress, mediaId, userId] });
      queryClient.invalidateQueries({ queryKey: [cfg.keys.review, mediaId, userId] });
      queryClient.invalidateQueries({ queryKey: [cfg.keys.episodeWatch, mediaId, userId] });
      queryClient.invalidateQueries({ queryKey: [cfg.keys.reviews, mediaId] });
      queryClient.invalidateQueries({ queryKey: [cfg.keys.root] });
      setConfirmDeleteOpen(false);
      onClose?.();
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const toggleListMutation = useMutation({
    mutationFn: ({ listId, isMember }: { listId: string; isMember: boolean }) => {
      const body = { type: cfg.listType, listId, userId, [cfg.idKey]: mediaId };

      return isMember
        ? api.delete(apiEndpoints.listItem(listId), { data: body })
        : api.post(apiEndpoints.listItem(listId), body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [cfg.keys.listStatus, mediaId, userId] });
      queryClient.invalidateQueries({ queryKey: [cfg.keys.containingLists, mediaId] });
      queryClient.invalidateQueries({ queryKey: [cfg.keys.root] });
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const createListMutation = useMutation({
    mutationFn: (name: string) => api.post(apiEndpoints.list, { name, userId, type: cfg.listType }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [cfg.keys.lists, userId] }),
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const handleNewListBlur = () => {
    const trimmed = newListInput?.trim();
    if (trimmed) {
      createListMutation.mutate(trimmed);
    }
    setNewListInput(null);
  };

  const handleSave = async () => {
    const progress = progressForm.getValues();

    if (!mediaId || !progress.status) {
      onClose?.();
      return;
    }

    try {
      if (!(await progressForm.trigger())) return;

      await saveProgressMutation.mutateAsync(progress);

      const review = reviewForm.getValues();

      if (progress.status === "completed" && Number(review.overall) > 0) {
        if (!(await reviewForm.trigger())) return;

        await saveReviewMutation.mutateAsync(review);
      }

      onClose?.();
    } catch {
      toast.error(t("api:INTERNAL_SERVER_ERROR"));
    }
  };

  const isSaving = saveProgressMutation.isPending || saveReviewMutation.isPending;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="flex flex-col gap-4">
          <div className="bg-muted/30 rounded-lg h-72 p-4 border border-border/50">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon icon={"lucide:star"} className="size-4" />
              {t("feed:progress")}
            </h3>

            <div className="space-y-3">
              <Field>
                <FieldLabel htmlFor="status" className="text-sm font-medium">
                  {t("library:status")}
                </FieldLabel>
                <Controller
                  control={progressForm.control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder={t("feed:selectStatus")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {t(`feed:lists.${status}`)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="episodes" className="text-sm font-medium">
                  {t("library:episode_other")}
                </FieldLabel>
                <InputGroup className="bg-background">
                  <InputGroupInput
                    id="episodes"
                    type="number"
                    min={0}
                    max={orderedEpisodes.length || totalEpisodes}
                    value={episodeInput}
                    disabled={orderedEpisodes.length === 0 || setEpisodesMutation.isPending}
                    onChange={(e) => setEpisodeInput(e.target.value)}
                    onBlur={commitEpisodeCount}
                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>/{totalEpisodes}</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor="rewatches" className="text-sm font-medium">
                  {t("feed:totalRewatches")}
                </FieldLabel>
                <Input
                  id="rewatches"
                  type="number"
                  min={0}
                  max={999}
                  step={1}
                  placeholder="0"
                  className="bg-background"
                  {...progressForm.register("watchCount")}
                  aria-label={t("feed:totalRewatches")}
                />
              </Field>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 border h-55 border-border/50">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon icon={"lucide:calendar"} className="size-4" />
              {t("feed:timeline")}
            </h3>

            <div className="space-y-3">
              <Field>
                <FieldLabel htmlFor="startDate" className="text-sm font-medium">
                  {t("feed:startDate")}
                </FieldLabel>
                <Controller
                  control={progressForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          data-empty={!field.value}
                          className="w-full justify-start text-left font-normal bg-background"
                        >
                          <Icon icon={"lucide:calendar"} className="size-4 mr-2" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span className="text-muted-foreground">{t("feed:pickADate")}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="finishDate" className="text-sm font-medium">
                  {t("feed:finishDate")}
                </FieldLabel>
                <Controller
                  control={progressForm.control}
                  name="finishDate"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          data-empty={!field.value}
                          className="w-full justify-start text-left font-normal bg-background"
                        >
                          <Icon icon={"lucide:calendar"} className="size-4 mr-2" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span className="text-muted-foreground">{t("feed:pickADate")}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {cfg.hasProgressNotes && (
            <div className="bg-muted/30 rounded-lg h-72 p-4 border border-border/50 flex flex-col">
              <h3 className="font-semibold text-foreground mb-3">{t("feed:notes")}</h3>
              <Textarea
                placeholder={t("feed:notesPlaceholder")}
                className="flex-1 bg-background resize-none"
                maxLength={PROGRESS_NOTES_MAX_LENGTH}
                aria-invalid={Boolean(progressForm.formState.errors.notes)}
                aria-label={t("feed:notes")}
                {...progressForm.register("notes")}
              />
              <div className="flex items-center justify-between gap-2 mt-2">
                {progressForm.formState.errors.notes?.message ? (
                  <FieldError>{progressForm.formState.errors.notes.message}</FieldError>
                ) : (
                  <span />
                )}
                <span className="text-xs text-muted-foreground">
                  {progressNotes.length}/{PROGRESS_NOTES_MAX_LENGTH}
                </span>
              </div>
            </div>
          )}

          <div
            className={
              cfg.hasProgressNotes
                ? "bg-muted/30 rounded-lg p-4 border border-border/50 flex flex-col h-55"
                : "bg-muted/30 rounded-lg p-4 border border-border/50 flex flex-col flex-1 min-h-[18rem]"
            }
          >
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h3 className="font-semibold text-foreground">{t("feed:customLists")}</h3>
              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => setNewListInput("")}>
                <Icon icon={"lucide:plus"} className="size-3" />
              </Button>
            </div>
            <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1">
              {lists.map((list) => (
                <Field key={list.id} orientation="horizontal">
                  <Checkbox
                    id={list.id}
                    checked={isInList(list.id)}
                    disabled={toggleListMutation.isPending}
                    onCheckedChange={() => toggleListMutation.mutate({ listId: list.id, isMember: isInList(list.id) })}
                  />
                  <FieldLabel htmlFor={list.id} className="cursor-pointer text-sm">
                    {list.name}
                  </FieldLabel>
                </Field>
              ))}
              {newListInput !== null && (
                <Field orientation="horizontal">
                  <Checkbox checked={false} disabled />
                  <Input
                    autoFocus
                    value={newListInput}
                    onChange={(e) => setNewListInput(e.target.value)}
                    onBlur={handleNewListBlur}
                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                    placeholder={t("feed:newList")}
                    className="h-6 text-sm bg-background px-2 py-0"
                    aria-label={t("feed:newList")}
                  />
                </Field>
              )}
              {lists.length === 0 && newListInput === null && (
                <p className="text-sm text-muted-foreground">{t("library:noLists")}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {(progressStatus === "completed" || progressStatus === "dropped") && (
        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Icon icon={"lucide:pen-line"} className="size-4" />
            {t("feed:review")}
          </h3>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("feed:overall")}</span>
                <Controller
                  control={reviewForm.control}
                  name="overall"
                  render={({ field }) => (
                    <RatingGroupAdvanced
                      max={5}
                      allowHalf
                      value={field.value}
                      onValueChange={field.onChange}
                      allowClear
                    />
                  )}
                />
              </div>
              {cfg.reviewCriteria.map((criterion) => (
                <div key={criterion.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t(criterion.labelKey)}</span>
                  <Controller
                    control={reviewForm.control}
                    name={criterion.name}
                    render={({ field }) => (
                      <RatingGroupAdvanced
                        max={5}
                        allowHalf
                        value={field.value as string}
                        onValueChange={field.onChange}
                        allowClear
                      />
                    )}
                  />
                </div>
              ))}
            </div>
            <Field>
              <FieldLabel htmlFor="summary" className="text-sm font-medium">
                {t("feed:summary")}
              </FieldLabel>
              <Textarea
                id="summary"
                placeholder={t("feed:summaryPlaceholder")}
                className="bg-background resize-none min-h-25"
                maxLength={SUMMARY_MAX_LENGTH}
                aria-invalid={Boolean(reviewForm.formState.errors.summary)}
                aria-label={t("feed:summary")}
                {...reviewForm.register("summary")}
              />
              <div className="flex items-center justify-between gap-2">
                {reviewForm.formState.errors.summary?.message ? (
                  <FieldError>{reviewForm.formState.errors.summary.message}</FieldError>
                ) : (
                  <span />
                )}
                <span className="text-xs text-muted-foreground">
                  {summary.length}/{SUMMARY_MAX_LENGTH}
                </span>
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="reviewNotes" className="text-sm font-medium">
                {t("feed:notes")}
              </FieldLabel>
              <Textarea
                id="reviewNotes"
                placeholder={t("feed:notesPlaceholder")}
                className="bg-background resize-none min-h-25"
                maxLength={REVIEW_NOTES_MAX_LENGTH}
                aria-invalid={Boolean(reviewForm.formState.errors.notes)}
                aria-label={t("feed:notes")}
                {...reviewForm.register("notes")}
              />
              <div className="flex items-center justify-between gap-2">
                {reviewForm.formState.errors.notes?.message ? (
                  <FieldError>{reviewForm.formState.errors.notes.message}</FieldError>
                ) : (
                  <span />
                )}
                <span className="text-xs text-muted-foreground">
                  {reviewNotes.length}/{REVIEW_NOTES_MAX_LENGTH}
                </span>
              </div>
            </Field>
            {cfg.hasStoryText && (
              <Field>
                <FieldLabel htmlFor="story" className="text-sm font-medium">
                  {t("feed:story")}
                </FieldLabel>
                <Textarea
                  id="story"
                  placeholder={t("feed:storyPlaceholder")}
                  className="bg-background resize-none min-h-25"
                  maxLength={STORY_MAX_LENGTH}
                  aria-invalid={Boolean(reviewForm.formState.errors.storyText)}
                  aria-label={t("feed:story")}
                  {...reviewForm.register("storyText")}
                />
                <div className="flex items-center justify-between gap-2">
                  {reviewForm.formState.errors.storyText?.message ? (
                    <FieldError>{reviewForm.formState.errors.storyText.message}</FieldError>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {storyText.length}/{STORY_MAX_LENGTH}
                  </span>
                </div>
              </Field>
            )}
            <Field orientation="horizontal">
              <Controller
                control={reviewForm.control}
                name="recommended"
                render={({ field }) => (
                  <Checkbox
                    id="recommended"
                    checked={field.value}
                    aria-label={t("feed:recommended")}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                )}
              />
              <FieldLabel htmlFor="recommended" className="cursor-pointer text-sm">
                {t("feed:recommended")}
              </FieldLabel>
            </Field>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 pb-4 border-t border-border/50">
        <Button
          variant="destructive"
          size="sm"
          className="gap-2"
          disabled={(!progressQuery.data && !reviewQuery.data) || deleteProgressMutation.isPending}
          onClick={() => setConfirmDeleteOpen(true)}
        >
          <Icon icon={"lucide:trash"} className="size-4" />
        </Button>

        <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("feed:removeConfirmTitle")}</DialogTitle>
              <DialogDescription>{t("feed:removeConfirmDescription")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setConfirmDeleteOpen(false)}>
                {t("feed:cancel")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteProgressMutation.isPending}
                onClick={() => deleteProgressMutation.mutate()}
              >
                {t("feed:removeConfirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onClose?.()}>
            {t("feed:cancel")}
          </Button>
          <Button size="sm" className="gap-2" onClick={handleSave} disabled={isSaving}>
            <Icon icon={"lucide:save"} className="size-4" />
            {isSaving ? t("feed:saving") : t("feed:save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
