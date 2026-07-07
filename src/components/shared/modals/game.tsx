import { Icon } from "@iconify/react";
import { useMutation } from "@tanstack/react-query";
import { Image } from "@unpic/react";
import { format } from "date-fns";
import { type DragEvent, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useGameReview, useUploadImage } from "@/hooks/game.ts";
import { api, apiEndpoints } from "@/lib/api.ts";
import { useSession } from "@/lib/auth.ts";
import { Button } from "../../ui/button";
import { Calendar } from "../../ui/calendar";
import { Checkbox } from "../../ui/checkbox";
import { Field, FieldLabel } from "../../ui/field";
import { Input } from "../../ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "../../ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";

interface PendingScreenshot {
  file: File;
  previewUrl: string;
  isSpoiler: boolean;
  description: string;
}

interface GameModalProps {
  gameId?: string;
  initialStartDate?: Date;
  onStatusChange?: (status: string) => void;
  onSaveSuccess?: (status: string, reviewId?: string) => void;
}

export function GameModal({ gameId, initialStartDate, onStatusChange, onSaveSuccess }: GameModalProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(initialStartDate);
  const [finishDate, setFinishDate] = useState<Date>();
  const [customLists, setCustomLists] = useState<string[]>(["2026", "Favorites", "Play Later"]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedCompletion, setSelectedCompletion] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [replays, setReplays] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [newListInput, setNewListInput] = useState<string | null>(null);
  const [pendingScreenshots, setPendingScreenshots] = useState<PendingScreenshot[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // IN BUILD
  console.log(selectedCompletion);

  const session = useSession();
  const userId = session?.data?.user?.id;

  const gameReviewMutation = useGameReview();
  const uploadImageMutation = useUploadImage();

  const createListMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post(apiEndpoints.list, {
        name,
        userId,
        type: "Game",
      });
      return data;
    },
  });

  const { t } = useTranslation();

  const handleAddList = () => setNewListInput("");

  const handleNewListBlur = () => {
    if (newListInput?.trim()) {
      const trimmed = newListInput.trim();
      setCustomLists((prev) => [...prev, trimmed]);
      createListMutation.mutate(trimmed);
    }
    setNewListInput(null);
  };

  const toggleCustomList = (list: string) => {
    setCustomLists((prev) => (prev.includes(list) ? prev.filter((l) => l !== list) : [...prev, list]));
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newScreenshots: PendingScreenshot[] = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isSpoiler: false,
      description: "",
    }));
    setPendingScreenshots((prev) => [...prev, ...newScreenshots]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFileSelect(event.dataTransfer.files);
  };

  const handleRemoveScreenshot = (index: number) => {
    setPendingScreenshots((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSave = async () => {
    if (!selectedStatus || !userId || !gameId) return;
    console.log(userId, gameId);

    if (selectedStatus === "played" || selectedStatus === "replayed") {
      const review = await gameReviewMutation.mutateAsync({
        gameId,
        userId,
        overall: 0,
        notes,
      });

      if (pendingScreenshots.length > 0 && review?.id) {
        await Promise.all(
          pendingScreenshots.map(async (screenshot) => {
            const imageUrl = await uploadImageMutation.mutateAsync(screenshot.file);
            await api.post(apiEndpoints.gameReviewScreenshot, {
              gameReviewId: review.id,
              isSpoiler: screenshot.isSpoiler,
              url: imageUrl,
              description: screenshot.description || undefined,
            });
          }),
        );
      }

      onSaveSuccess?.(selectedStatus, review?.id);
      return;
    }

    onSaveSuccess?.(selectedStatus);
  };

  const isSaving = gameReviewMutation.isPending || uploadImageMutation.isPending || createListMutation.isPending;

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
                <Select
                  onValueChange={(value) => {
                    setSelectedStatus(value);
                    onStatusChange?.(value);

                    if ((value === "played" || value === "replayed") && !finishDate) setFinishDate(new Date());
                  }}
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder={t("feed:selectStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="planning">{t("feed:lists.planning")}</SelectItem>
                      <SelectItem value="playing">{t("feed:lists.playing")}</SelectItem>
                      <SelectItem value="played">{t("feed:lists.played")}</SelectItem>
                      <SelectItem value="replaying">{t("feed:lists.replaying")}</SelectItem>
                      <SelectItem value="dropped">{t("feed:lists.dropped")}</SelectItem>
                      <SelectItem value="paused">{t("feed:lists.paused")}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="completionStatus" className="text-sm font-medium">
                  {t("feed:completionStatus.label")}
                </FieldLabel>
                <Select onValueChange={setSelectedCompletion}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder={t("feed:completionStatus.select")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="mainStory">{t("feed:completionStatus.mainStory")}</SelectItem>
                      <SelectItem value="mainStoryPlusExtras">
                        {t("feed:completionStatus.mainStoryPlusExtras")}
                      </SelectItem>
                      <SelectItem value="100%">100%</SelectItem>
                      <SelectItem value="endless">{t("feed:completionStatus.endless")}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="progress" className="text-sm font-medium">
                  {t("feed:progress")}
                </FieldLabel>
                <InputGroup className="bg-background">
                  <InputGroupInput
                    id="progress"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="0"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>%</InputGroupText>
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
                  value={replays}
                  onChange={(e) => setReplays(Number(e.target.value))}
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

          {/** biome-ignore lint/a11y/useSemanticElements: false */}
          <div
            role={"button"}
            tabIndex={0}
            className="flex flex-col justify-center rounded-md border mt-2 border-dashed border-input px-6 py-8 text-muted-foreground cursor-pointer"
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
              accept=".png, .jpeg, .jpg, .webp"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {pendingScreenshots.length > 0 && (
            <div className="space-y-2">
              {pendingScreenshots.map((screenshot, index) => (
                <div
                  key={screenshot.previewUrl}
                  className="flex items-start gap-3 bg-muted/30 rounded-lg p-3 border border-border/50"
                >
                  <Image
                    src={screenshot.previewUrl}
                    width={56}
                    height={56}
                    alt="Screenshot preview"
                    className="size-14 object-cover rounded-md shrink-0"
                  />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <Input
                      placeholder={t("feed:screenshotDescription")}
                      className="h-7 text-xs bg-background"
                      value={screenshot.description}
                      onChange={(e) =>
                        setPendingScreenshots((prev) =>
                          prev.map((s, i) => (i === index ? { ...s, description: e.target.value } : s)),
                        )
                      }
                    />
                    <Field orientation="horizontal">
                      <Checkbox
                        id={`spoiler-${index}`}
                        checked={screenshot.isSpoiler}
                        onCheckedChange={(checked) =>
                          setPendingScreenshots((prev) =>
                            prev.map((s, i) => (i === index ? { ...s, isSpoiler: !!checked } : s)),
                          )
                        }
                      />
                      <FieldLabel htmlFor={`spoiler-${index}`} className="text-xs cursor-pointer">
                        {t("feed:spoiler")}
                      </FieldLabel>
                    </Field>
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveScreenshot(index)}
                  >
                    <Icon icon={"lucide:x"} className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <h3 className="font-semibold text-foreground mb-3">{t("feed:notes")}</h3>
            <Textarea
              placeholder={t("feed:notesPlaceholder")}
              className="min-h-25 bg-background resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">{t("feed:customLists")}</h3>
              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={handleAddList}>
                <Icon icon={"lucide:plus"} className="size-3" />
              </Button>
            </div>
            <div className="space-y-2">
              {["2026", "Favorites", "Play Later"].map((list) => (
                <Field key={list} orientation="horizontal">
                  <Checkbox
                    id={list}
                    checked={customLists.includes(list)}
                    onCheckedChange={() => toggleCustomList(list)}
                  />
                  <FieldLabel htmlFor={list} className="cursor-pointer text-sm">
                    {list}
                  </FieldLabel>
                </Field>
              ))}
              {customLists.slice(3).map((list) => (
                <Field key={list} orientation="horizontal">
                  <Checkbox
                    id={list}
                    checked={customLists.includes(list)}
                    onCheckedChange={() => toggleCustomList(list)}
                  />
                  <FieldLabel htmlFor={list} className="cursor-pointer text-sm">
                    {list}
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
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-border/50">
        <Button variant="destructive" size="sm" className="gap-2">
          <Icon icon={"lucide:trash"} className="size-4" />
          {t("feed:remove")}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            {t("feed:cancel")}
          </Button>
          <Button size="sm" className="gap-2" onClick={handleSave} disabled={isSaving || !selectedStatus || !gameId}>
            <Icon icon={"lucide:save"} className="size-4" />
            {isSaving ? t("feed:saving") : t("feed:save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
