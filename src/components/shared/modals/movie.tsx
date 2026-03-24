import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar1, Plus, Save, Star, Trash } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api.ts";
import { useSession } from "@/lib/auth.ts";
import { Button } from "../../ui/button";
import { Calendar } from "../../ui/calendar";
import { Checkbox } from "../../ui/checkbox";
import { Field, FieldLabel } from "../../ui/field";
import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";

interface MovieModalProps {
  mediaData?: any;
  onStatusChange?: (status: string) => void;
  onSaveSuccess?: (status: string) => void;
}

export function MovieModal({ mediaData: _, onStatusChange, onSaveSuccess }: MovieModalProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [finishDate, setFinishDate] = useState<Date>();
  const [customLists, setCustomLists] = useState<string[]>(["2026", "Favorites", "Watch Later"]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [newListInput, setNewListInput] = useState<string | null>(null);

  const session = useSession();

  const createListMutation = useMutation({
    mutationFn: async (name: string) => {
      await api.post("/list", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, userId: session?.data?.user?.id, type: "Movie" }),
      });
    },
  });

  const handleAddList = () => setNewListInput("");

  const handleNewListBlur = () => {
    if (newListInput?.trim()) {
      const trimmed = newListInput.trim();
      setCustomLists((prev) => [...prev, trimmed]);
      createListMutation.mutate(trimmed);
    }
    setNewListInput(null);
  };
  const { t } = useTranslation();

  const toggleCustomList = (list: string) => {
    setCustomLists((prev) => (prev.includes(list) ? prev.filter((l) => l !== list) : [...prev, list]));
  };

  const handleSave = async () => {
    if (selectedStatus) {
      onSaveSuccess?.(selectedStatus);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Star className="size-4" />
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
                  }}
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder={t("feed:selectStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="planning">{t("feed:lists.planning")}</SelectItem>
                      <SelectItem value="completed">{t("feed:lists.completed")}</SelectItem>
                      <SelectItem value="dropped">{t("feed:lists.dropped")}</SelectItem>
                      <SelectItem value="paused">{t("feed:lists.paused")}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="format" className="text-sm font-medium">
                  {t("feed:format")}
                </FieldLabel>
                <Select>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder={t("feed:selectFormat")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="streaming">{t("feed:formats.streaming")}</SelectItem>
                      <SelectItem value="cinema">{t("feed:formats.cinema")}</SelectItem>
                      <SelectItem value="bluray">{t("feed:formats.bluray")}</SelectItem>
                      <SelectItem value="DVD">{t("feed:formats.DVD")}</SelectItem>
                      <SelectItem value="VHS">{t("feed:formats.VHS")}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="rewatches" className="text-sm font-medium">
                  {t("feed:totalRewatches")}
                </FieldLabel>
                <Input id="rewatches" type="number" min={0} placeholder="0" className="bg-background" />
              </Field>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar1 className="size-4" />
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
                      <Calendar1 className="size-4 mr-2" />
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
                      <Calendar1 className="size-4 mr-2" />
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
            <Textarea placeholder={t("feed:notesPlaceholder")} className="min-h-25 bg-background resize-none" />
          </div>

          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">{t("feed:customLists")}</h3>
              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={handleAddList}>
                <Plus className="size-3" />
              </Button>
            </div>
            <div className="space-y-2">
              {["2026", "Favorites", "Watch Later"].map((list) => (
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
          <Trash className="size-4" />
          {t("feed:remove")}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            {t("feed:cancel")}
          </Button>
          <Button size="sm" className="gap-2" onClick={handleSave}>
            <Save className="size-4" />
            {t("feed:save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
