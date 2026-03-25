import { useMutation } from "@tanstack/react-query";
import { Check, Plus, Trash2, XIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FeedComposer } from "@/components/pages/feed/composer.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { RatingGroupAdvanced } from "@/components/ui/rating-group-advanced.tsx";
import { api } from "@/lib/api.ts";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaTitle: string;
  mediaImage: string;
  reviewId?: string;
  ratingCriteria?: Array<{ id: string; label: string }>;
}

export function ReviewModal({
  open,
  onOpenChange,
  mediaTitle = "Media Title",
  mediaImage,
  reviewId,
  ratingCriteria = [
    { id: "gameplay", label: "Gameplay" },
    { id: "graphics", label: "Graphics" },
    { id: "sound", label: "Audio" },
    { id: "story", label: "Story" },
  ],
}: ReviewModalProps) {
  const { t } = useTranslation();
  const [overallRating, setOverallRating] = useState("0");
  const [criteriaRatings, setCriteriaRatings] = useState<Record<string, string>>(
    Object.fromEntries(ratingCriteria.map((c) => [c.id, "0"])),
  );
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [newPro, setNewPro] = useState("");
  const [newCon, setNewCon] = useState("");

  const updateReviewMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      try {
        const { data } = await api.patch(`/game/review/${reviewId}`, payload);
        return data;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
  });

  const handleAddPro = () => {
    if (newPro.trim()) {
      setPros([...pros, newPro.trim()]);
      setNewPro("");
    }
  };

  const handleRemovePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const handleAddCon = () => {
    if (newCon.trim()) {
      setCons([...cons, newCon.trim()]);
      setNewCon("");
    }
  };

  const handleRemoveCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const handleCriteriaChange = (criteriaId: string, value: string) => {
    setCriteriaRatings((prev) => ({ ...prev, [criteriaId]: value }));
  };

  const handleSubmit = async () => {
    if (!reviewId) return;

    await updateReviewMutation.mutateAsync({
      overall: Number(overallRating),
      gameplay: Number(criteriaRatings.gameplay),
      graphics: Number(criteriaRatings.graphics),
      sound: Number(criteriaRatings.sound),
      story: Number(criteriaRatings.story),
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <DialogHeader className="h-48 p-4 flex flex-row items-center bg-cover bg-center px-6 relative rounded-t-lg">
          {mediaImage && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center rounded-t-lg"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url("${mediaImage}")`,
                }}
              />
              <div className="absolute inset-0 backdrop-blur-sm bg-black/20 rounded-t-lg" />
            </>
          )}

          <img
            src={mediaImage}
            alt="Cover"
            className="w-24 h-32 object-cover rounded-lg shadow-2xl relative z-10 border-2 border-white/30"
          />
          <div className="flex-1 px-6 relative z-10">
            <DialogTitle className="text-white font-bold text-2xl drop-shadow-lg">{mediaTitle}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-6 space-y-6">
          <div className="bg-card rounded-lg p-4 border border-border/50">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold text-foreground">{t("feed:overall")}</h3>
              <RatingGroupAdvanced max={5} allowHalf={true} value={overallRating} onValueChange={setOverallRating} />
            </div>
            <hr className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ratingCriteria.map((criteria) => (
                <div key={criteria.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    {/** biome-ignore lint/a11y/noLabelWithoutControl: no form */}
                    <label className="text-sm font-medium">{criteria.label}</label>
                    <RatingGroupAdvanced
                      max={5}
                      allowHalf={true}
                      value={criteriaRatings[criteria.id]}
                      onValueChange={(value) => handleCriteriaChange(criteria.id, value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-500/5 rounded-lg p-4 border border-green-500/20">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Check className="text-green-600" />
                {t("feed:pros")}
              </h3>
              <div className="space-y-2 mb-4">
                {pros.map((pro, index) => (
                  <div
                    key={`pro-${index}`}
                    className="flex items-center justify-between gap-2 bg-background rounded-md px-3 py-2 border border-border/50"
                  >
                    <span className="text-sm flex-1">{pro}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemovePro(index)}
                      className="size-6 p-0"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 w-full items-center">
                <Input
                  placeholder={t("feed:addPositive")}
                  value={newPro}
                  onChange={(e) => setNewPro(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddPro()}
                  className="text-sm w-full"
                />
                <Button onClick={handleAddPro} size="sm" variant="outline" className="px-3 h-9">
                  <Plus className="size-4 grow" />
                </Button>
              </div>
            </div>

            <div className="bg-red-500/5 rounded-lg p-4 border border-red-500/20">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <XIcon className="text-red-600" /> {t("feed:cons")}
              </h3>
              <div className="space-y-2 mb-4">
                {cons.map((con, index) => (
                  <div
                    key={`con-${index}`}
                    className="flex items-center justify-between gap-2 bg-background rounded-md px-3 py-2 border border-border/50"
                  >
                    <span className="text-sm flex-1">{con}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveCon(index)}
                      className="size-6 p-0"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 items-center w-full">
                <Input
                  placeholder={t("feed:addNegative")}
                  value={newCon}
                  onChange={(e) => setNewCon(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCon()}
                  className="text-sm w-full"
                />
                <Button onClick={handleAddCon} size="sm" variant="outline" className="px-3 h-9">
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          <FeedComposer />
        </div>

        <div className="border-t border-border px-6 py-4 flex justify-between gap-3 bg-background rounded-b-lg">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("feed:cancel")}
          </Button>
          <Button onClick={handleSubmit} className="gap-2" disabled={updateReviewMutation.isPending || !reviewId}>
            {updateReviewMutation.isPending ? t("feed:saving") : t("feed:save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
