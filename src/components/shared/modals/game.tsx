import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "@unpic/react";
import { format } from "date-fns";
import type { TFunction } from "i18next";
import { type DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import {
  useCreateGameScreenshot,
  useDeleteGameScreenshot,
  useGameScreenshots,
  useUpdateGameScreenshot,
  useUploadImage,
  validateScreenshotFile,
} from "@/hooks/game.ts";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";
import { useSession } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Calendar } from "../../ui/calendar";
import { Checkbox } from "../../ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../ui/command";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Field, FieldError, FieldLabel } from "../../ui/field";
import { Input } from "../../ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "../../ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { RatingGroupAdvanced } from "../../ui/rating-group-advanced";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";

type ProgressStatus = "Planning" | "Playing" | "Completed" | "Paused" | "Dropped";

const STATUS_OPTIONS = ["planning", "playing", "played", "replaying", "dropped", "paused"] as const;

const STATUS_TO_ENUM: Record<string, ProgressStatus> = {
  planning: "Planning",
  playing: "Playing",
  played: "Completed",
  replaying: "Playing",
  dropped: "Dropped",
  paused: "Paused",
};

const ENUM_TO_STATUS: Record<ProgressStatus, string> = {
  Planning: "planning",
  Playing: "playing",
  Completed: "played",
  Paused: "paused",
  Dropped: "dropped",
};

const COMPLETION_OPTIONS = ["mainStory", "mainStoryPlusExtras", "100%", "endless"] as const;

const SUMMARY_MAX_LENGTH = 500;
const REVIEW_NOTES_MAX_LENGTH = 1000;
const PROGRESS_NOTES_MAX_LENGTH = 1000;
// Mirrors the `@MaxLength(255)` on CreateGameScreenshotDto.description.
const SCREENSHOT_DESCRIPTION_MAX_LENGTH = 255;

function createProgressSchema(t: TFunction) {
  return z.object({
    status: z.string(),
    completion: z.string(),
    platforms: z.array(z.string()),
    hoursPlayed: z.string(),
    playCount: z.string(),
    startDate: z.date().optional(),
    finishDate: z.date().optional(),
    notes: z.string().trim().max(PROGRESS_NOTES_MAX_LENGTH, t("feed:reviewNotesMax")),
  });
}

type ProgressFormData = z.infer<ReturnType<typeof createProgressSchema>>;

function createReviewSchema(t: TFunction) {
  return z.object({
    overall: z.string(),
    graphics: z.string(),
    sound: z.string(),
    story: z.string(),
    gameplay: z.string(),
    summary: z.string().trim().max(SUMMARY_MAX_LENGTH, t("feed:reviewSummaryMax")),
    notes: z.string().trim().max(REVIEW_NOTES_MAX_LENGTH, t("feed:reviewNotesMax")),
    recommended: z.boolean(),
  });
}

type ReviewFormData = z.infer<ReturnType<typeof createReviewSchema>>;

interface GameProgressData {
  id: string;
  status: ProgressStatus;
  playCount: number | null;
  completion: string | null;
  platforms: string[] | null;
  hoursPlayed: number | null;
  notes: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

interface GameReviewData {
  id: string;
  overall: number | string;
  graphics: number | string | null;
  sound: number | string | null;
  story: number | string | null;
  gameplay: number | string | null;
  summary: string | null;
  notes: string | null;
  recommended: boolean | null;
}

interface UploadingScreenshot {
  tempId: string;
  previewUrl: string;
}

interface GamePlatform {
  name?: string | null;
  slug?: string | null;
}

interface GameModalProps {
  gameId?: string;
  platforms?: GamePlatform[];
  onClose?: () => void;
}

export function GameModal({ gameId, platforms, onClose }: GameModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const session = useSession();
  const userId = session?.data?.user?.id;
  const enabled = !!userId && !!gameId;

  const platformOptions = useMemo(
    () =>
      (platforms ?? []).flatMap((platform) =>
        platform.name && platform.slug ? [{ name: platform.name, slug: platform.slug }] : [],
      ),
    [platforms],
  );

  const progressSchema = useMemo(() => createProgressSchema(t), [t]);

  const progressForm = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      status: "",
      completion: "",
      platforms: [],
      hoursPlayed: "",
      playCount: "",
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
    defaultValues: {
      overall: "0",
      graphics: "0",
      sound: "0",
      story: "0",
      gameplay: "0",
      summary: "",
      notes: "",
      recommended: false,
    },
  });

  const summary = reviewForm.watch("summary") ?? "";
  const reviewNotes = reviewForm.watch("notes") ?? "";

  const [newListInput, setNewListInput] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [uploadingScreenshots, setUploadingScreenshots] = useState<UploadingScreenshot[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImageMutation = useUploadImage();
  const createScreenshotMutation = useCreateGameScreenshot();
  const updateScreenshotMutation = useUpdateGameScreenshot();
  const deleteScreenshotMutation = useDeleteGameScreenshot();

  const screenshotsQuery = useGameScreenshots({ userId, gameId });

  const screenshots = useMemo(
    () => screenshotsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [screenshotsQuery.data],
  );

  const progressQuery = useQuery<GameProgressData | null>({
    queryKey: ["gameProgress", gameId, userId],
    queryFn: () =>
      api
        .get(apiEndpoints.gameProgress, { params: { userId, gameId } })
        .then(({ data }) => data.gameProgresses.items[0] ?? null),
    enabled,
  });

  const reviewQuery = useQuery<GameReviewData | null>({
    queryKey: ["gameReview", gameId, userId],
    queryFn: () =>
      api
        .get(`${apiEndpoints.gameReview}/?gameId=${gameId}&userId=${userId}`)
        .then(({ data }) => data.gameReviews.items[0] ?? null),
    enabled,
  });

  const listsQuery = useQuery<ApiTypes.List[]>({
    queryKey: ["gameLists", userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListsByUserIdResponse>(apiEndpoints.getListsByUserId(userId as string), {
          params: { type: "Game", itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists.items),
    enabled: !!userId,
  });

  const lists = listsQuery.data ?? [];

  const listStatusQuery = useQuery<string[]>({
    queryKey: ["gameListStatus", gameId, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListStatusResponse>(apiEndpoints.getListStatus, {
          params: { type: "Game", gameId },
        })
        .then(({ data }) => data.listIds),
    enabled,
  });

  const listIds = listStatusQuery.data ?? [];

  const isInList = (listId: string) => listIds.includes(listId);

  useEffect(() => {
    const progress = progressQuery.data;
    if (!progress) return;

    const nameBySlug = new Map(platformOptions.map((platform) => [platform.slug, platform.name]));

    progressForm.reset({
      status: ENUM_TO_STATUS[progress.status] ?? "",
      completion: progress.completion ?? "",
      platforms: (progress.platforms ?? []).flatMap((slug) => {
        const name = nameBySlug.get(slug);

        return name ? [name] : [];
      }),
      hoursPlayed: progress.hoursPlayed != null ? String(progress.hoursPlayed) : "",
      playCount: progress.playCount != null ? String(progress.playCount) : "",
      notes: progress.notes ?? "",
      startDate: progress.startedAt ? new Date(progress.startedAt) : undefined,
      finishDate: progress.completedAt ? new Date(progress.completedAt) : undefined,
    });
  }, [progressQuery.data, progressForm.reset, platformOptions]);

  useEffect(() => {
    const review = reviewQuery.data;
    if (!review) return;

    reviewForm.reset({
      overall: String(Number(review.overall)),
      graphics: review.graphics != null ? String(Number(review.graphics)) : "0",
      sound: review.sound != null ? String(Number(review.sound)) : "0",
      story: review.story != null ? String(Number(review.story)) : "0",
      gameplay: review.gameplay != null ? String(Number(review.gameplay)) : "0",
      summary: review.summary ?? "",
      notes: review.notes ?? "",
      recommended: !!review.recommended,
    });
  }, [reviewQuery.data, reviewForm.reset]);

  const uploadingScreenshotsRef = useRef<UploadingScreenshot[]>([]);
  uploadingScreenshotsRef.current = uploadingScreenshots;

  useEffect(
    () => () => {
      for (const screenshot of uploadingScreenshotsRef.current) {
        URL.revokeObjectURL(screenshot.previewUrl);
      }
    },
    [],
  );

  const invalidateProgress = () => {
    queryClient.invalidateQueries({ queryKey: ["gameProgress", gameId, userId] });
    queryClient.invalidateQueries({ queryKey: ["game"] });
  };

  const saveProgressMutation = useMutation({
    mutationFn: (data: ProgressFormData) => {
      const status = STATUS_TO_ENUM[data.status];

      return api.post(apiEndpoints.gameProgress, {
        gameId,
        status,
        playCount: data.playCount ? Number(data.playCount) : undefined,
        completion: data.completion || undefined,
        platforms: platformOptions.length > 0 ? data.platforms : undefined,
        hoursPlayed: data.hoursPlayed ? Number(data.hoursPlayed) : undefined,
        notes: data.notes.trim() || undefined,
        startedAt: data.startDate ?? undefined,
        completedAt: status === "Completed" ? (data.finishDate ?? new Date()) : (data.finishDate ?? undefined),
      });
    },
    onSuccess: invalidateProgress,
  });

  const saveReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData): Promise<string | undefined> => {
      const body = {
        gameId,
        overall: Number(data.overall),
        graphics: Number(data.graphics) || undefined,
        sound: Number(data.sound) || undefined,
        story: Number(data.story) || undefined,
        gameplay: Number(data.gameplay) || undefined,
        summary: data.summary.trim() || undefined,
        notes: data.notes.trim() || undefined,
        recommended: data.recommended,
      };

      const existing = reviewQuery.data;

      if (existing) {
        await api.patch(`${apiEndpoints.gameReview}/${existing.id}`, body);
        return existing.id;
      }

      const { data: response } = await api.post(apiEndpoints.gameReview, body);
      return response.gameReview?.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gameReview", gameId, userId] });
      queryClient.invalidateQueries({ queryKey: ["gameReviews", gameId] });
      queryClient.invalidateQueries({ queryKey: ["game"] });
    },
  });

  const deleteProgressMutation = useMutation({
    mutationFn: () => api.delete(apiEndpoints.resetGameTracking(gameId as string)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gameProgress", gameId, userId] });
      queryClient.invalidateQueries({ queryKey: ["gameReview", gameId, userId] });
      queryClient.invalidateQueries({ queryKey: ["gameReviews", gameId] });
      queryClient.invalidateQueries({ queryKey: ["game-screenshots"] });
      queryClient.invalidateQueries({ queryKey: ["game"] });
      setConfirmDeleteOpen(false);
      onClose?.();
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const toggleListMutation = useMutation({
    mutationFn: ({ listId, isMember }: { listId: string; isMember: boolean }) => {
      const body = { type: "Game", listId, userId, gameId };

      return isMember
        ? api.delete(apiEndpoints.listItem(listId), { data: body })
        : api.post(apiEndpoints.listItem(listId), body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gameListStatus", gameId, userId] });
      queryClient.invalidateQueries({ queryKey: ["gameContainingLists", gameId] });
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const createListMutation = useMutation({
    mutationFn: (name: string) => api.post(apiEndpoints.list, { name, userId, type: "Game" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gameLists", userId] }),
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const handleNewListBlur = () => {
    const trimmed = newListInput?.trim();
    if (trimmed) {
      createListMutation.mutate(trimmed);
    }
    setNewListInput(null);
  };

  const uploadScreenshot = async (file: File) => {
    const tempId = crypto.randomUUID();
    const previewUrl = URL.createObjectURL(file);

    setUploadingScreenshots((prev) => [...prev, { tempId, previewUrl }]);

    try {
      const url = await uploadImageMutation.mutateAsync(file);

      await createScreenshotMutation.mutateAsync({ gameId: gameId as string, url });
    } catch {
      toast.error(t("feed:screenshotUploadFailed"));
    } finally {
      setUploadingScreenshots((prev) => prev.filter((screenshot) => screenshot.tempId !== tempId));
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !gameId) return;

    for (const file of Array.from(files)) {
      const error = validateScreenshotFile(file);

      if (error) {
        toast.error(t(error, { name: file.name }));
        continue;
      }

      // Each file uploads on its own so a single failure doesn't drop the others.
      void uploadScreenshot(file);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFileSelect(event.dataTransfer.files);
  };

  const handleSave = async () => {
    const progress = progressForm.getValues();

    if (!gameId || !progress.status) {
      onClose?.();
      return;
    }

    try {
      if (!(await progressForm.trigger())) return;

      await saveProgressMutation.mutateAsync(progress);

      const review = reviewForm.getValues();

      if ((progress.status === "played" || progress.status === "dropped") && Number(review.overall) > 0) {
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon icon={"lucide:star"} className="size-4" />
              {t("common:progress")}
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
                <FieldLabel htmlFor="completionStatus" className="text-sm font-medium">
                  {t("feed:completionStatus.label")}
                </FieldLabel>
                <Controller
                  control={progressForm.control}
                  name="completion"
                  render={({ field }) => (
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder={t("feed:completionStatus.select")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {COMPLETION_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option === "100%" ? "100%" : t(`feed:completionStatus.${option}`)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              {platformOptions.length > 0 && (
                <Field>
                  <FieldLabel htmlFor="platforms" className="text-sm font-medium">
                    {t("library:platforms")}
                  </FieldLabel>
                  <Controller
                    control={progressForm.control}
                    name="platforms"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger
                          id="platforms"
                          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex min-h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border bg-background px-3 py-1.5 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                        >
                          {field.value.length > 0 ? (
                            <span className="flex flex-wrap gap-1">
                              {field.value.map((platform) => (
                                <Badge key={platform} variant="secondary">
                                  {platform}
                                </Badge>
                              ))}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{t("feed:selectPlatforms")}</span>
                          )}
                          <Icon icon={"lucide:chevron-down"} className="size-4 shrink-0 opacity-50" />
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
                          <Command>
                            <CommandInput placeholder={t("user:search")} />
                            <CommandList>
                              <CommandEmpty>{t("common:noResults")}</CommandEmpty>
                              <CommandGroup>
                                {platformOptions.map((platform) => (
                                  <CommandItem
                                    key={platform.slug}
                                    value={platform.name}
                                    className="cursor-pointer pr-8"
                                    onSelect={() =>
                                      field.onChange(
                                        field.value.includes(platform.name)
                                          ? field.value.filter((selected) => selected !== platform.name)
                                          : [...field.value, platform.name],
                                      )
                                    }
                                  >
                                    {platform.name}
                                    <Icon
                                      icon={"lucide:check"}
                                      className={cn(
                                        "absolute right-2 size-4 text-foreground",
                                        field.value.includes(platform.name) ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="hoursPlayed" className="text-sm font-medium">
                  {t("feed:hoursPlayed")}
                </FieldLabel>
                <InputGroup className="bg-background">
                  <InputGroupInput
                    id="hoursPlayed"
                    type="number"
                    min={0}
                    placeholder="0"
                    {...progressForm.register("hoursPlayed")}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>h</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor="replays" className="text-sm font-medium">
                  {t("feed:totalReplays")}
                </FieldLabel>
                <Input
                  id="replays"
                  type="number"
                  min={0}
                  placeholder="0"
                  className="bg-background"
                  {...progressForm.register("playCount")}
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
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

          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon icon={"lucide:images"} className="size-4" />
              {t("common:screenshots")}
            </h3>

            {/** biome-ignore lint/a11y/useSemanticElements: false */}
            <div
              role={"button"}
              tabIndex={0}
              className="flex flex-col justify-center rounded-md border border-dashed border-input px-6 py-8 text-muted-foreground cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <Icon icon={"lucide:image"} className="mx-auto size-12" aria-hidden={true} />
              <p className="relative text-sm font-medium text-center mt-2">
                <Trans
                  i18nKey={"feed:uploadScreenshot"}
                  components={{
                    span: <span className="text-primary hover:underline" />,
                  }}
                />
              </p>
              <input
                ref={fileInputRef}
                id="screenshot"
                name="screenshot"
                type="file"
                multiple
                className="sr-only"
                accept=".png, .jpeg, .jpg, .gif, .webp"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>

            {(screenshots.length > 0 || uploadingScreenshots.length > 0) && (
              <div className="space-y-2 mt-3 max-h-72 overflow-y-auto pr-1">
                {uploadingScreenshots.map((screenshot) => (
                  <div
                    key={screenshot.tempId}
                    className="flex items-center gap-3 bg-background/50 rounded-lg p-3 border border-border/50"
                  >
                    <Image
                      src={screenshot.previewUrl}
                      width={56}
                      height={56}
                      alt=""
                      className="size-14 object-cover rounded-md shrink-0 opacity-50"
                    />
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon icon={"lucide:loader-circle"} className="size-3.5 animate-spin" />
                      {t("feed:screenshotUploading")}
                    </span>
                  </div>
                ))}

                {screenshots.map((screenshot) => (
                  <ScreenshotRow
                    key={screenshot.id}
                    screenshot={screenshot}
                    onDescriptionChange={(description) =>
                      updateScreenshotMutation.mutate({ screenshotId: screenshot.id, description })
                    }
                    onSpoilerChange={(isSpoiler) =>
                      updateScreenshotMutation.mutate({ screenshotId: screenshot.id, isSpoiler })
                    }
                    onRemove={() => deleteScreenshotMutation.mutate(screenshot.id)}
                    isRemoving={
                      deleteScreenshotMutation.isPending && deleteScreenshotMutation.variables === screenshot.id
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50 flex flex-col">
            <h3 className="font-semibold text-foreground mb-3">{t("feed:notes")}</h3>
            <Textarea
              placeholder={t("feed:notesPlaceholder")}
              className="min-h-25 bg-background resize-none"
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

          <div className="bg-muted/30 rounded-lg p-4 border border-border/50 flex flex-col">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h3 className="font-semibold text-foreground">{t("feed:customLists")}</h3>
              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => setNewListInput("")}>
                <Icon icon={"lucide:plus"} className="size-3" />
              </Button>
            </div>
            <div className="space-y-2 flex-1 min-h-0 max-h-55 overflow-y-auto pr-1">
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

      {(progressStatus === "played" || progressStatus === "dropped" || progressStatus === "replaying") && (
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
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("feed:criteries.graphics")}</span>
                <Controller
                  control={reviewForm.control}
                  name="graphics"
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
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("feed:criteries.soundtrack")}</span>
                <Controller
                  control={reviewForm.control}
                  name="sound"
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
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("feed:criteries.story")}</span>
                <Controller
                  control={reviewForm.control}
                  name="story"
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
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("feed:criteries.gameplay")}</span>
                <Controller
                  control={reviewForm.control}
                  name="gameplay"
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
                {t("common:cancel")}
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
            {t("common:cancel")}
          </Button>
          <Button size="sm" className="gap-2" onClick={handleSave} disabled={isSaving}>
            <Icon icon={"lucide:save"} className="size-4" />
            {isSaving ? t("feed:saving") : t("common:saveChanges")}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ScreenshotRowProps {
  screenshot: ApiTypes.GameScreenshot;
  onDescriptionChange: (description: string) => void;
  onSpoilerChange: (isSpoiler: boolean) => void;
  onRemove: () => void;
  isRemoving: boolean;
}

/**
 * Keeps the description in local state so typing never fights the refetch that
 * follows each PATCH; the change is only committed on blur.
 */
function ScreenshotRow({ screenshot, onDescriptionChange, onSpoilerChange, onRemove, isRemoving }: ScreenshotRowProps) {
  const { t } = useTranslation();

  const [description, setDescription] = useState(screenshot.description ?? "");

  const handleBlur = () => {
    if (description === (screenshot.description ?? "")) return;

    onDescriptionChange(description);
  };

  return (
    <div className="flex items-start gap-3 bg-background/50 rounded-lg p-3 border border-border/50">
      <Image
        src={screenshot.url}
        width={56}
        height={56}
        alt={screenshot.description ?? ""}
        className={`size-14 object-cover rounded-md shrink-0 ${screenshot.isSpoiler ? "blur-sm" : ""}`}
      />
      <div className="flex-1 space-y-1.5 min-w-0">
        <Input
          placeholder={t("feed:screenshotDescription")}
          className="h-7 text-xs bg-background"
          maxLength={SCREENSHOT_DESCRIPTION_MAX_LENGTH}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleBlur}
        />
        <Field orientation="horizontal">
          <Checkbox
            id={`spoiler-${screenshot.id}`}
            checked={screenshot.isSpoiler}
            onCheckedChange={(checked) => onSpoilerChange(!!checked)}
          />
          <FieldLabel htmlFor={`spoiler-${screenshot.id}`} className="text-xs cursor-pointer">
            {t("feed:spoiler")}
          </FieldLabel>
        </Field>
      </div>
      <Button
        variant="ghost"
        size="xs"
        className="shrink-0 text-muted-foreground hover:text-destructive"
        disabled={isRemoving}
        onClick={onRemove}
      >
        <Icon
          icon={isRemoving ? "lucide:loader-circle" : "lucide:x"}
          className={`size-3.5 ${isRemoving ? "animate-spin" : ""}`}
        />
      </Button>
    </div>
  );
}
