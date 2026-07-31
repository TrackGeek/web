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
import { useSession } from "@/lib/auth/client";
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

type ProgressStatus = "Planning" | "Reading" | "Completed" | "Paused" | "Dropped";

const STATUS_OPTIONS = ["planning", "reading", "completed", "rereading", "dropped", "paused"] as const;

const STATUS_TO_ENUM: Record<string, ProgressStatus> = {
  planning: "Planning",
  reading: "Reading",
  completed: "Completed",
  rereading: "Reading",
  dropped: "Dropped",
  paused: "Paused",
};

const ENUM_TO_STATUS: Record<ProgressStatus, string> = {
  Planning: "planning",
  Reading: "reading",
  Completed: "completed",
  Paused: "paused",
  Dropped: "dropped",
};

const REVIEW_STATUSES = ["completed", "dropped", "rereading"];

const SUMMARY_MAX_LENGTH = 500;
const REVIEW_NOTES_MAX_LENGTH = 1000;

function createProgressSchema() {
  return z.object({
    status: z.string(),
    pagesRead: z.string(),
    readCount: z.string(),
    startDate: z.date().optional(),
    finishDate: z.date().optional(),
  });
}

type ProgressFormData = z.infer<ReturnType<typeof createProgressSchema>>;

function createReviewSchema(t: TFunction) {
  return z.object({
    overall: z.string(),
    characters: z.string(),
    language: z.string(),
    theme: z.string(),
    summary: z.string().trim().max(SUMMARY_MAX_LENGTH, t("feed:reviewSummaryMax")),
    notes: z.string().trim().max(REVIEW_NOTES_MAX_LENGTH, t("feed:reviewNotesMax")),
    recommended: z.boolean(),
  });
}

type ReviewFormData = z.infer<ReturnType<typeof createReviewSchema>>;

interface BookProgressData {
  id: string;
  status: ProgressStatus;
  chaptersRead: number | null;
  readCount: number | null;
  startedAt: string | null;
  completedAt: string | null;
}

interface BookModalProps {
  bookId?: string;
  totalPages?: number | null;
  onClose?: () => void;
}

export function BookModal({ bookId, totalPages, onClose }: BookModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const session = useSession();
  const userId = session?.data?.user?.id;
  const enabled = !!userId && !!bookId;

  const [newListInput, setNewListInput] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const progressSchema = useMemo(() => createProgressSchema(), []);

  const progressForm = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      status: "",
      pagesRead: "",
      readCount: "",
      startDate: undefined,
      finishDate: undefined,
    },
  });

  const progressStatus = progressForm.watch("status");

  const reviewSchema = useMemo(() => createReviewSchema(t), [t]);

  const reviewForm = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      overall: "0",
      characters: "0",
      language: "0",
      theme: "0",
      summary: "",
      notes: "",
      recommended: false,
    },
  });

  const summary = reviewForm.watch("summary") ?? "";
  const reviewNotes = reviewForm.watch("notes") ?? "";

  const progressQuery = useQuery<BookProgressData | null>({
    queryKey: ["bookProgress", bookId, userId],
    queryFn: () =>
      api
        .get(apiEndpoints.getBookProgress(userId as string, bookId as string))
        .then(({ data }) => data.bookProgresses.items[0] ?? null),
    enabled,
  });

  const reviewQuery = useQuery<ApiTypes.Review | null>({
    queryKey: ["bookReview", bookId, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetReviewsResponse>(`${apiEndpoints.bookReview}/?bookId=${bookId}&userId=${userId}`)
        .then(({ data }) => data.bookReviews?.items[0] ?? null),
    enabled,
  });

  const listsQuery = useQuery<ApiTypes.List[]>({
    queryKey: ["bookLists", userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListsByUserIdResponse>(apiEndpoints.getListsByUserId(userId as string), {
          params: { type: "Book", itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists.items),
    enabled: !!userId,
  });

  const lists = listsQuery.data ?? [];

  const listStatusQuery = useQuery<string[]>({
    queryKey: ["bookListStatus", bookId, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListStatusResponse>(apiEndpoints.getListStatus, {
          params: { type: "Book", bookId },
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
      pagesRead: progress.chaptersRead != null ? String(progress.chaptersRead) : "",
      readCount: progress.readCount != null ? String(progress.readCount) : "",
      startDate: progress.startedAt ? new Date(progress.startedAt) : undefined,
      finishDate: progress.completedAt ? new Date(progress.completedAt) : undefined,
    });
  }, [progressQuery.data, progressForm.reset]);

  useEffect(() => {
    const review = reviewQuery.data;
    if (!review) return;

    reviewForm.reset({
      overall: String(Number(review.overall)),
      characters: review.characters != null ? String(Number(review.characters)) : "0",
      language: review.language != null ? String(Number(review.language)) : "0",
      theme: review.theme != null ? String(Number(review.theme)) : "0",
      summary: review.summary ?? "",
      notes: review.notes ?? "",
      recommended: !!review.recommended,
    });
  }, [reviewQuery.data, reviewForm.reset]);

  const saveProgressMutation = useMutation({
    mutationFn: (data: ProgressFormData) => {
      const status = STATUS_TO_ENUM[data.status];

      return api.post(apiEndpoints.bookProgress, {
        bookId,
        status,
        chaptersRead: data.pagesRead.trim() === "" ? undefined : Number(data.pagesRead),
        readCount: data.readCount.trim() === "" ? undefined : Number(data.readCount),
        startedAt: data.startDate ?? undefined,
        completedAt: status === "Completed" ? (data.finishDate ?? new Date()) : data.finishDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookProgress", bookId, userId] });
      queryClient.invalidateQueries({ queryKey: ["book"] });
    },
  });

  const saveReviewMutation = useMutation({
    mutationFn: (data: ReviewFormData) => {
      const body = {
        bookId,
        overall: Number(data.overall),
        characters: Number(data.characters) || undefined,
        language: Number(data.language) || undefined,
        theme: Number(data.theme) || undefined,
        summary: data.summary.trim() || undefined,
        notes: data.notes.trim() || undefined,
        recommended: data.recommended,
      };

      const existing = reviewQuery.data;

      return existing
        ? api.patch(`${apiEndpoints.bookReview}/${existing.id}`, body)
        : api.post(apiEndpoints.bookReview, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookReview", bookId, userId] });
      queryClient.invalidateQueries({ queryKey: ["bookReviews", bookId] });
      queryClient.invalidateQueries({ queryKey: ["book"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (reviewQuery.data) {
        await api.delete(`${apiEndpoints.bookReview}/${reviewQuery.data.id}`);
      }
      if (progressQuery.data) {
        await api.delete(`${apiEndpoints.bookProgress}/${progressQuery.data.id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookProgress", bookId, userId] });
      queryClient.invalidateQueries({ queryKey: ["bookReview", bookId, userId] });
      queryClient.invalidateQueries({ queryKey: ["bookReviews", bookId] });
      queryClient.invalidateQueries({ queryKey: ["book"] });
      setConfirmDeleteOpen(false);
      onClose?.();
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const toggleListMutation = useMutation({
    mutationFn: ({ listId, isMember }: { listId: string; isMember: boolean }) => {
      const body = { type: "Book", listId, userId, bookId };

      return isMember
        ? api.delete(apiEndpoints.listItem(listId), { data: body })
        : api.post(apiEndpoints.listItem(listId), body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookListStatus", bookId, userId] });
      queryClient.invalidateQueries({ queryKey: ["bookContainingLists", bookId] });
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const createListMutation = useMutation({
    mutationFn: (name: string) => api.post(apiEndpoints.list, { name, userId, type: "Book" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookLists", userId] }),
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

    if (!bookId || !progress.status) {
      onClose?.();
      return;
    }

    try {
      if (!(await progressForm.trigger())) return;

      await saveProgressMutation.mutateAsync(progress);

      const review = reviewForm.getValues();

      if (REVIEW_STATUSES.includes(progress.status) && Number(review.overall) > 0) {
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
                    <SelectTrigger id="status" className="w-full bg-background">
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
              <FieldLabel htmlFor="pages" className="text-sm font-medium">
                {t("library:page_other")}
              </FieldLabel>
              <InputGroup className="bg-background">
                <InputGroupInput
                  id="pages"
                  type="number"
                  min={0}
                  max={totalPages ?? undefined}
                  placeholder="0"
                  {...progressForm.register("pagesRead")}
                />
                {!!totalPages && (
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>/{totalPages}</InputGroupText>
                  </InputGroupAddon>
                )}
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="rereads" className="text-sm font-medium">
                {t("feed:totalRereads")}
              </FieldLabel>
              <Input
                id="rereads"
                type="number"
                min={0}
                placeholder="0"
                className="bg-background"
                {...progressForm.register("readCount")}
              />
            </Field>
          </div>
        </div>

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

      {REVIEW_STATUSES.includes(progressStatus) && (
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
                <span className="text-sm font-medium">{t("feed:criteries.characters")}</span>
                <Controller
                  control={reviewForm.control}
                  name="characters"
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
                <span className="text-sm font-medium">{t("feed:criteries.language")}</span>
                <Controller
                  control={reviewForm.control}
                  name="language"
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
                <span className="text-sm font-medium">{t("feed:criteries.theme")}</span>
                <Controller
                  control={reviewForm.control}
                  name="theme"
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
                {t("common:cancel")}
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
