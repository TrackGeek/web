import { Icon } from "@iconify/react";
import { t } from "i18next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface BackfillEpisodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  episodeCount: number;
  isLoading?: boolean;
  onConfirm: (remember: boolean) => void;
  onDecline: (remember: boolean) => void;
}

export function BackfillEpisodesDialog({
  open,
  onOpenChange,
  episodeCount,
  isLoading = false,
  onConfirm,
  onDecline,
}: BackfillEpisodesDialogProps) {
  const [remember, setRemember] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) setRemember(false);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon="lucide:list-checks" className="size-5 text-primary" />
            {t("library:backfillTitle")}
          </DialogTitle>
          <DialogDescription>{t("library:backfillDescription", { count: episodeCount })}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Checkbox
            id="backfill-remember"
            checked={remember}
            onCheckedChange={(checked) => setRemember(checked === true)}
            disabled={isLoading}
          />
          <Label htmlFor="backfill-remember" className="text-sm text-muted-foreground cursor-pointer">
            {t("library:backfillRemember")}
          </Label>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={isLoading} onClick={() => onDecline(remember)}>
            {t("library:backfillDecline")}
          </Button>
          <Button disabled={isLoading} onClick={() => onConfirm(remember)}>
            {isLoading && <Icon icon="lucide:loader-2" className="size-4 animate-spin" />}
            {t("library:backfillConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
