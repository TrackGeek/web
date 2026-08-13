import { Icon } from "@iconify/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatRelativeTime } from "@/lib/utils/date";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";

interface RefreshDataProps {
  sourceURL: string;
  onSubmit?: () => void;
  lastRefreshedAt: Date;
}

export function RefreshData({ sourceURL, onSubmit, lastRefreshedAt }: RefreshDataProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const relativeTime = formatRelativeTime(lastRefreshedAt, i18n.language);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full group">
          {t("library:refreshData")}
          {relativeTime && (
            <span className="text-muted-foreground -ml-1 group-hover:text-muted">
              • {relativeTime}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-white font-bold">{t("library:refreshDataModal.title")}</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-12rem)]">
          <p className="mb-4">{t("library:refreshDataModal.description")}</p>
          <div className="flex justify-between items-center pt-4 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOpen(false);
              }}
            >
              {t("common:cancel")}
            </Button>
            <div className="flex gap-2">
              <a href={sourceURL} target="_blank" rel="noopener">
                <Button size="sm" className="gap-2">
                  <Icon icon={"lucide:external-link"} className="size-4" />
                  {t("library:refreshDataModal.checkSource")}
                </Button>
              </a>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => {
                  setOpen(false);
                  onSubmit?.();
                }}
              >
                <Icon icon={"lucide:refresh-ccw"} className="size-4" />
                {t("library:refreshDataModal.refreshInfoButton")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
