import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";
import { useSession } from "@/lib/auth.ts";
import { Button } from "../../ui/button";
import { Calendar } from "../../ui/calendar";
import { Checkbox } from "../../ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Field, FieldLabel } from "../../ui/field";
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

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [finishDate, setFinishDate] = useState<Date>();
  const [watchCount, setWatchCount] = useState("");

  const [overall, setOverall] = useState("0");
  const [direction, setDirection] = useState("0");
  const [production, setProduction] = useState("0");
  const [acting, setActing] = useState("0");
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [recommended, setRecommended] = useState(false);

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

    setSelectedStatus(ENUM_TO_STATUS[progress.status] ?? null);
    setWatchCount(progress.watchCount != null ? String(progress.watchCount) : "");
    setNotes(progress.notes ?? "");
    setStartDate(progress.startedAt ? new Date(progress.startedAt) : undefined);
    setFinishDate(progress.completedAt ? new Date(progress.completedAt) : undefined);
  }, [progressQuery.data]);

  useEffect(() => {
    const review = reviewQuery.data;
    if (!review) return;

    setOverall(String(Number(review.overall)));
    setDirection(review.direction != null ? String(Number(review.direction)) : "0");
    setProduction(review.production != null ? String(Number(review.production)) : "0");
    setActing(review.acting != null ? String(Number(review.acting)) : "0");
    setSummary(review.summary ?? "");
    setRecommended(!!review.recommended);
  }, [reviewQuery.data]);

  const isCompleted = selectedStatus === "completed";

  const invalidateProgress = () => {
    queryClient.invalidateQueries({ queryKey: ["tvProgress", tvShowId, userId] });
    queryClient.invalidateQueries({ queryKey: ["tvEpisodeWatch", tvShowId, userId] });
    queryClient.invalidateQueries({ queryKey: ["tv"] });
  };

  const saveProgressMutation = useMutation({
    mutationFn: () => {
      const status = STATUS_TO_ENUM[selectedStatus as string];

      return api.post(apiEndpoints.tvShowProgress, {
        tvShowId,
        status,
        watchCount: watchCount ? Number(watchCount) : undefined,
        notes: notes.trim() || undefined,
        startedAt: startDate ?? undefined,
        completedAt: status === "Completed" ? (finishDate ?? new Date()) : (finishDate ?? undefined),
      });
    },
    onSuccess: invalidateProgress,
  });

  const saveReviewMutation = useMutation({
    mutationFn: () => {
      const body = {
        tvShowId,
        overall: Number(overall),
        direction: Number(direction) || undefined,
        production: Number(production) || undefined,
        acting: Number(acting) || undefined,
        summary: summary.trim() || undefined,
        notes: notes.trim() || undefined,
        recommended,
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tvListStatus", tvShowId, userId] }),
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
    if (!tvShowId || !selectedStatus) {
      onClose?.();
      return;
    }

    try {
      await saveProgressMutation.mutateAsync();

      if (isCompleted && Number(overall) > 0) {
        await saveReviewMutation.mutateAsync();
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
              {t("feed:progress")}
            </h3>
            <div className="space-y-3">
              <Field>
                <FieldLabel htmlFor="status" className="text-sm font-medium">
                  {t("library:status")}
                </FieldLabel>
                <Select value={selectedStatus ?? undefined} onValueChange={(value) => setSelectedStatus(value)}>
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
                  value={watchCount}
                  onChange={(e) => setWatchCount(e.target.value)}
                />
              </Field>
            </div>
          </div>

          {isCompleted && (
            <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon icon={"lucide:pen-line"} className="size-4" />
                {t("feed:review")}
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t("feed:overall")}</span>
                  <RatingGroupAdvanced max={5} allowHalf value={overall} onValueChange={setOverall} allowClear />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t("feed:criteries.direction")}</span>
                  <RatingGroupAdvanced max={5} allowHalf value={direction} onValueChange={setDirection} allowClear />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t("feed:criteries.production")}</span>
                  <RatingGroupAdvanced max={5} allowHalf value={production} onValueChange={setProduction} allowClear />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t("feed:criteries.acting")}</span>
                  <RatingGroupAdvanced max={5} allowHalf value={acting} onValueChange={setActing} allowClear />
                </div>
                <Field>
                  <FieldLabel htmlFor="summary" className="text-sm font-medium">
                    {t("feed:summary")}
                  </FieldLabel>
                  <Input
                    id="summary"
                    placeholder={t("feed:summaryPlaceholder")}
                    className="bg-background"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    maxLength={250}
                  />
                </Field>
                <Field orientation="horizontal">
                  <Checkbox
                    id="recommended"
                    checked={recommended}
                    onCheckedChange={(checked) => setRecommended(checked === true)}
                  />
                  <FieldLabel htmlFor="recommended" className="cursor-pointer text-sm">
                    {t("feed:recommended")}
                  </FieldLabel>
                </Field>
              </div>
            </div>
          )}
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      data-empty={!startDate}
                      className="w-full justify-start text-left font-normal bg-background"
                    >
                      <Icon icon={"lucide:calendar"} className="size-4 mr-2" />
                      {startDate ? (
                        format(startDate, "PPP")
                      ) : (
                        <span className="text-muted-foreground">{t("feed:pickADate")}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                  </PopoverContent>
                </Popover>
              </Field>

              <Field>
                <FieldLabel htmlFor="finishDate" className="text-sm font-medium">
                  {t("feed:finishDate")}
                </FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      data-empty={!finishDate}
                      className="w-full justify-start text-left font-normal bg-background"
                    >
                      <Icon icon={"lucide:calendar"} className="size-4 mr-2" />
                      {finishDate ? (
                        format(finishDate, "PPP")
                      ) : (
                        <span className="text-muted-foreground">{t("feed:pickADate")}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={finishDate} onSelect={setFinishDate} />
                  </PopoverContent>
                </Popover>
              </Field>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <h3 className="font-semibold text-foreground mb-3">{t("feed:notes")}</h3>
            <Textarea
              placeholder={t("feed:notesPlaceholder")}
              className="min-h-25 bg-background resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
            />
          </div>

          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">{t("feed:customLists")}</h3>
              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => setNewListInput("")}>
                <Icon icon={"lucide:plus"} className="size-3" />
              </Button>
            </div>
            <div className="space-y-2">
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
