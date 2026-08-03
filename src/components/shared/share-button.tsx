import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
}

export function ShareButton({ title, text, url, className }: ShareButtonProps) {
  const { t } = useTranslation();

  const handleShare = async () => {
    const shareUrl = url ?? window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t("common:linkCopied"));
    } catch {
      toast.error(t("common:somethingWentWrong"));
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label={t("feed:share")}
          onClick={handleShare}
          className={cn("backdrop-blur-sm", className)}
        >
          <Icon icon={"lucide:share"} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t("feed:share")}</TooltipContent>
    </Tooltip>
  );
}
