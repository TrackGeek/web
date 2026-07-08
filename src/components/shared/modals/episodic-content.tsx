import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import type { TFunction } from "i18next";
import { useEffect, useMemo, useState } from "react";
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
    summary: z.string().trim().max(SUMMARY_MAX_LENGTH, t("feed:review.errors.summaryMax")),
    notes: z.string().trim().max(REVIEW_NOTES_MAX_LENGTH, t("feed:review.errors.notesMax")),
    story: z.string().trim().max(STORY_MAX_LENGTH, t("feed:review.errors.storyMax")),
    recommended: z.boolean(),
  });
}

type ReviewFormData = z.infer<ReturnType<typeof createReviewSchema>>;

interface TVShowProgressData {
  id: string;
  status: ProgressStatus;
  watchCount: number | null;
  notes: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

interface EpisodicContentModalProps {
  tvShowId?: string;
  totalEpisodes?: number;
  watchedEpisodes?: number;
  onClose?: () => void;
}

export function EpisodicContentModal({
  tvShowId,
  totalEpisodes = 0,
  watchedEpisodes = 0,
  onClose,
}: EpisodicContentModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const session = useSession();
  const userId = session?.data?.user?.id;
  const enabled = !!userId && !!tvShowId;

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
  const isCompleted = progressStatus === "completed";

  const reviewSchema = useMemo(() => createReviewSchema(t), [t]);

  const reviewForm = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      overall: "0",
      direction: "0",
      production: "0",
      acting: "0",
      summary: "",
      notes: "",
      story: "",
      recommended: false,
    },
  });

  const summary = reviewForm.watch("summary") ?? "";
  const story = reviewForm.watch("story") ?? "";
  const reviewNotes = reviewForm.watch("notes") ?? "";

  const [newListInput, setNewListInput] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const progressQuery = useQuery<TVShowProgressData | null>({
    queryKey: ["tvProgress", tvShowId, userId],
    queryFn: () =>
      api
        .get(apiEndpoints.getTvShowProgress(userId as string, tvShowId as string))
        .then(({ data }) => data.tvShowProgresses.items[0] ?? null),
    enabled,
  });

  const reviewQuery = useQuery<ApiTypes.TVShowReview | null>({
    queryKey: ["tvReview", tvShowId, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetTVShowReviewsResponse>(`${apiEndpoints.tvShowReview}/?tvShowId=${tvShowId}&userId=${userId}`)
        .then(({ data }) => data.tvShowReviews.items[0] ?? null),
    enabled,
  });

  const listsQuery = useQuery<ApiTypes.List[]>({
    queryKey: ["tvLists", userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListsByUserIdResponse>(apiEndpoints.getListsByUserId(userId as string), {
          params: { type: "TVShow", itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists.items),
    enabled,
  });

  const lists = listsQuery.data ?? [];

  const listStatusQuery = useQuery<string[]>({
    queryKey: ["tvListStatus", tvShowId, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListStatusResponse>(apiEndpoints.getListStatus, {
          params: { type: "TVShow", tvShowId },
        })
        .then(({ data }) => data.listIds),
    enabled,
  });

  const listIds = listStatusQuery.data ?? [];

  const isInList = (listId: string) => listIds.includes(listId);

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

    reviewForm.reset({
      overall: String(Number(review.overall)),
      direction: review.direction != null ? String(Number(review.direction)) : "0",
      production: review.production != null ? String(Number(review.production)) : "0",
      acting: review.acting != null ? String(Number(review.acting)) : "0",
      summary: review.summary ?? "",
      notes: review.notes ?? "",
      story: review.story ?? "",
      recommended: !!review.recommended,
    });
  }, [reviewQuery.data, reviewForm.reset]);

  const invalidateProgress = () => {
    queryClient.invalidateQueries({ queryKey: ["tvProgress", tvShowId, userId] });
    queryClient.invalidateQueries({ queryKey: ["tvEpisodeWatch", tvShowId, userId] });
    queryClient.invalidateQueries({ queryKey: ["tv"] });
  };

  const saveProgressMutation = useMutation({
    mutationFn: (data: ProgressFormData) => {
      const status = STATUS_TO_ENUM[data.status];

      return api.post(apiEndpoints.tvShowProgress, {
        tvShowId,
        status,
        watchCount: data.watchCount ? Number(data.watchCount) : undefined,
        notes: data.notes.trim() || undefined,
        startedAt: data.startDate ?? undefined,
        completedAt: status === "Completed" ? (data.finishDate ?? new Date()) : (data.finishDate ?? undefined),
      });
    },
    onSuccess: invalidateProgress,
  });

  const saveReviewMutation = useMutation({
    mutationFn: (data: ReviewFormData) => {
      const body = {
        tvShowId,
        overall: Number(data.overall),
        direction: Number(data.direction) || undefined,
        production: Number(data.production) || undefined,
        acting: Number(data.acting) || undefined,
        summary: data.summary.trim() || undefined,
        notes: data.notes.trim() || undefined,
        story: data.story.trim() || undefined,
        recommended: data.recommended,
      };

      const existing = reviewQuery.data;

      return existing
        ? api.patch(`${apiEndpoints.tvShowReview}/${existing.id}`, body)
        : api.post(apiEndpoints.tvShowReview, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tvReview", tvShowId, userId] });
      queryClient.invalidateQueries({ queryKey: ["tvReviews", tvShowId] });
      queryClient.invalidateQueries({ queryKey: ["tv"] });
    },
  });

  const deleteProgressMutation = useMutation({
    mutationFn: () => api.delete(apiEndpoints.resetTvShowTracking(tvShowId as string)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tvProgress", tvShowId, userId] });
      queryClient.invalidateQueries({ queryKey: ["tvReview", tvShowId, userId] });
      queryClient.invalidateQueries({ queryKey: ["tvEpisodeWatch", tvShowId, userId] });
      queryClient.invalidateQueries({ queryKey: ["tvReviews", tvShowId] });
      queryClient.invalidateQueries({ queryKey: ["tv"] });
      setConfirmDeleteOpen(false);
      onClose?.();
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const toggleListMutation = useMutation({
    mutationFn: ({ listId, isMember }: { listId: string; isMember: boolean }) => {
      const body = { type: "TVShow", listId, userId, tvShowId };

      return isMember
        ? api.delete(apiEndpoints.listItem(listId), { data: body })
        : api.post(apiEndpoints.listItem(listId), body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tvListStatus", tvShowId, userId] });
      queryClient.invalidateQueries({ queryKey: ["tvContainingLists", tvShowId] });
      queryClient.invalidateQueries({ queryKey: ["tv"] });
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const createListMutation = useMutation({
    mutationFn: (name: string) => api.post(apiEndpoints.list, { name, userId, type: "TVShow" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tvLists", userId] }),
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

    if (!tvShowId || !progress.status) {
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
                  <InputGroupInput id="episodes" type="number" min={0} value={watchedEpisodes} readOnly />
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
                  placeholder="0"
                  className="bg-background"
                  {...progressForm.register("watchCount")}
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
          <div className="bg-muted/30 rounded-lg h-72 p-4 border border-border/50 flex flex-col">
            <h3 className="font-semibold text-foreground mb-3">{t("feed:notes")}</h3>
            <Textarea
              placeholder={t("feed:notesPlaceholder")}
              className="flex-1 bg-background resize-none"
              maxLength={PROGRESS_NOTES_MAX_LENGTH}
              aria-invalid={Boolean(progressForm.formState.errors.notes)}
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

          <div className="bg-muted/30 rounded-lg p-4 border border-border/50 flex flex-col h-55">
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

      {isCompleted && (
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
                <span className="text-sm font-medium">{t("feed:criteries.direction")}</span>
                <Controller
                  control={reviewForm.control}
                  name="direction"
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
                <span className="text-sm font-medium">{t("feed:criteries.production")}</span>
                <Controller
                  control={reviewForm.control}
                  name="production"
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
                <span className="text-sm font-medium">{t("feed:criteries.acting")}</span>
                <Controller
                  control={reviewForm.control}
                  name="acting"
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
            <Field>
              <FieldLabel htmlFor="story" className="text-sm font-medium">
                {t("feed:story")}
              </FieldLabel>
              <Textarea
                id="story"
                placeholder={t("feed:storyPlaceholder")}
                className="bg-background resize-none min-h-25"
                maxLength={STORY_MAX_LENGTH}
                aria-invalid={Boolean(reviewForm.formState.errors.story)}
                {...reviewForm.register("story")}
              />
              <div className="flex items-center justify-between gap-2">
                {reviewForm.formState.errors.story?.message ? (
                  <FieldError>{reviewForm.formState.errors.story.message}</FieldError>
                ) : (
                  <span />
                )}
                <span className="text-xs text-muted-foreground">
                  {story.length}/{STORY_MAX_LENGTH}
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
          {t("feed:remove")}
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
