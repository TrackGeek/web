import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface OAuthClientRowProps {
  clientId: string;
  name: string;
  pending: boolean;
  onRemove: () => void;
}

export function OAuthClientRow({ clientId, name, pending, onRemove }: OAuthClientRowProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-4">
      <div className="min-w-0 flex-1">
        <p className="font-medium wrap-anywhere">{name}</p>
        <p className="break-all font-mono text-xs text-muted-foreground">{clientId}</p>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="min-h-11" disabled={pending}>
            {t("common:delete")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("settings:oauth.developer.deleteTitle", { name })}</DialogTitle>
            <DialogDescription>{t("settings:oauth.developer.deleteDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("common:cancel")}</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="destructive" onClick={onRemove}>
                {t("common:delete")}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
