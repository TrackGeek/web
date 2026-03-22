import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { api } from "@/lib/api.ts";

type MediaType = "anime" | "movie" | "tv" | "game" | "book" | "manga";

interface ConfirmDeleteItemProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaType: MediaType;
  id: string;
}

export function ConfirmDeleteItem({ open, onOpenChange, mediaType, id }: ConfirmDeleteItemProps) {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/${mediaType}/${id}`);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="size-5 text-destructive" />
            <DialogTitle>{t("common:confirmDelete")}</DialogTitle>
          </div>
          <DialogDescription>{t("common:confirmDeleteDescription")}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common:cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {t("common:delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
