import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TFunction } from "i18next";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";
import { useSession } from "@/lib/auth.ts";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Field, FieldError, FieldLabel } from "../../ui/field";
import { Input } from "../../ui/input";
import { RatingGroupAdvanced } from "../../ui/rating-group-advanced";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";

type ProgressStatus = "Planning" | "Completed" | "Paused" | "Dropped";

const STATUS_OPTIONS = ["planning", "completed", "dropped", "paused"] as const;

const STATUS_TO_ENUM: Record<string, ProgressStatus> = {
  planning: "Planning",
  completed: "Completed",
  dropped: "Dropped",
  paused: "Paused",
};

const ENUM_TO_STATUS: Record<ProgressStatus, string> = {
  Planning: "planning",
  Completed: "completed",
  Paused: "paused",
  Dropped: "dropped",
};

const SUMMARY_MAX_LENGTH = 500;
const STORY_MAX_LENGTH = 500;
const REVIEW_NOTES_MAX_LENGTH = 1000;

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

interface MovieProgressData {
  id: string;
  status: ProgressStatus;
}

interface MovieModalProps {
  movieId?: string;
  onClose?: () => void;
}

export function MovieModal({ movieId, onClose }: MovieModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const session = useSession();
  const userId = session?.data?.user?.id;
  const enabled = !!userId && !!movieId;

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [newListInput, setNewListInput] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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

  const progressQuery = useQuery<MovieProgressData | null>({
    queryKey: ["movieProgress", movieId, userId],
    queryFn: () =>
      api
        .get(apiEndpoints.getMovieProgress(userId as string, movieId as string))
        .then(({ data }) => data.movieProgresses.items[0] ?? null),
    enabled,
  });

  const reviewQuery = useQuery<ApiTypes.Review | null>({
    queryKey: ["movieReview", movieId, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetReviewsResponse>(`${apiEndpoints.movieReview}/?movieId=${movieId}&userId=${userId}`)
        .then(({ data }) => data.movieReviews?.items[0] ?? null),
    enabled,
  });

  const listsQuery = useQuery<ApiTypes.List[]>({
    queryKey: ["movieLists", userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListsByUserIdResponse>(apiEndpoints.getListsByUserId(userId as string), {
          params: { type: "Movie", itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists.items),
    enabled,
  });

  const lists = listsQuery.data ?? [];

  const listStatusQuery = useQuery<string[]>({
    queryKey: ["movieListStatus", movieId, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListStatusResponse>(apiEndpoints.getListStatus, {
          params: { type: "Movie", movieId },
        })
        .then(({ data }) => data.listIds),
    enabled,
  });

  const listIds = listStatusQuery.data ?? [];

  const isInList = (listId: string) => listIds.includes(listId);

  useEffect(() => {
    const progress = progressQuery.data;
    if (!progress) return;

    setSelectedStatus(ENUM_TO_STATUS[progress.status] ?? "");
  }, [progressQuery.data]);

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
    queryClient.invalidateQueries({ queryKey: ["movieProgress", movieId, userId] });
    queryClient.invalidateQueries({ queryKey: ["movie"] });
  };

  const saveProgressMutation = useMutation({
    mutationFn: (status: string) =>
      api.post(apiEndpoints.movieProgress, {
        movieId,
        status: STATUS_TO_ENUM[status],
      }),
    onSuccess: invalidateProgress,
  });

  const saveReviewMutation = useMutation({
    mutationFn: (data: ReviewFormData) => {
      const body = {
        movieId,
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
        ? api.patch(`${apiEndpoints.movieReview}/${existing.id}`, body)
        : api.post(apiEndpoints.movieReview, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movieReview", movieId, userId] });
      queryClient.invalidateQueries({ queryKey: ["movieReviews", movieId] });
      queryClient.invalidateQueries({ queryKey: ["movie"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (reviewQuery.data) {
        await api.delete(`${apiEndpoints.movieReview}/${reviewQuery.data.id}`);
      }
      if (progressQuery.data) {
        await api.delete(`${apiEndpoints.movieProgress}/${progressQuery.data.id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movieProgress", movieId, userId] });
      queryClient.invalidateQueries({ queryKey: ["movieReview", movieId, userId] });
      queryClient.invalidateQueries({ queryKey: ["movieReviews", movieId] });
      queryClient.invalidateQueries({ queryKey: ["movie"] });
      setConfirmDeleteOpen(false);
      onClose?.();
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const toggleListMutation = useMutation({
    mutationFn: ({ listId, isMember }: { listId: string; isMember: boolean }) => {
      const body = { type: "Movie", listId, userId, movieId };

      return isMember
        ? api.delete(apiEndpoints.listItem(listId), { data: body })
        : api.post(apiEndpoints.listItem(listId), body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movieListStatus", movieId, userId] });
      queryClient.invalidateQueries({ queryKey: ["movieContainingLists", movieId] });
      queryClient.invalidateQueries({ queryKey: ["movie"] });
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const createListMutation = useMutation({
    mutationFn: (name: string) => api.post(apiEndpoints.list, { name, userId, type: "Movie" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["movieLists", userId] }),
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
    if (!movieId || !selectedStatus) {
      onClose?.();
      return;
    }

    try {
      await saveProgressMutation.mutateAsync(selectedStatus);

      const review = reviewForm.getValues();

      if (selectedStatus === "completed" && Number(review.overall) > 0) {
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
        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Icon icon={"lucide:star"} className="size-4" />
            {t("feed:progress")}
          </h3>

          <Field>
            <FieldLabel htmlFor="status" className="text-sm font-medium">
              {t("library:status")}
            </FieldLabel>
            <Select value={selectedStatus || undefined} onValueChange={setSelectedStatus}>
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
          </Field>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 border border-border/50 flex flex-col">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h3 className="font-semibold text-foreground">{t("feed:customLists")}</h3>
            <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => setNewListInput("")}>
              <Icon icon={"lucide:plus"} className="size-3" />
            </Button>
          </div>
          <div className="space-y-2 flex-1 min-h-0 max-h-48 overflow-y-auto pr-1">
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

      {(selectedStatus === "completed" || selectedStatus === "dropped") && (
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
                aria-label={t("feed:story")}
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
          disabled={(!progressQuery.data && !reviewQuery.data) || deleteMutation.isPending}
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
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
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
