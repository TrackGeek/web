import { Icon } from "@iconify/react";
import { useIsMutating, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api";
import { useSession } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

interface CardReadingProgressProps {
  progress: { current: number; total: number | null };
  status?: ApiTypes.ProgressStatus;
  userId: string;
  mediaId: string;
  mediaType: "book" | "manga";
}

export function CardReadingProgress({ progress, status, userId, mediaId, mediaType }: CardReadingProgressProps) {
  const { t } = useTranslation();
  const session = useSession();
  const queryClient = useQueryClient();
  const mutationKey = ["increment-reading", mediaType, mediaId, userId];
  const isMutating = useIsMutating({ mutationKey }) > 0;
  const canIncrement = session.data?.user.id === userId && (status === "Reading" || status === "Rereading");
  const mutation = useMutation({
    mutationKey,
    mutationFn: async () => {
      if (!canIncrement || (progress.total !== null && progress.current >= progress.total)) return;
      await api.post(mediaType === "book" ? apiEndpoints.bookProgress : apiEndpoints.mangaProgress, {
        [`${mediaType}Id`]: mediaId,
        status,
        chaptersRead: progress.current + 1,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user-progress", mediaType, userId] }),
        queryClient.invalidateQueries({ queryKey: ["active-progress", mediaType, userId] }),
        queryClient.invalidateQueries({ queryKey: [`${mediaType}Progress`, mediaId, userId] }),
      ]);
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const unit = t(mediaType === "book" ? "library:page_other" : "library:chapters");
  const progressLabel = t("library:readingProgress", { unit, current: progress.current, total: progress.total ?? "?" });
  const incrementLabel = t("library:incrementReadingProgress");

  const progressPct = progress.total ? Math.min(100, Math.round((progress.current / progress.total) * 100)) : 0;

  return (
    <div
      className={cn(
        "absolute bottom-1 inset-x-0 mx-auto flex items-center w-fit justify-center bg-black/75 text-white backdrop-blur-xs",
        canIncrement ? "gap-1 rounded-b-md pl-1.5" : "rounded-md px-1.5",
      )}
    >
      {canIncrement && (
        <span className="absolute -top-0.5 left-0 right-0 h-0.5 rounded-t-md bg-white/20 overflow-hidden pointer-events-none">
          <span
            className="block h-full rounded-full bg-primary transition-all duration-300 rounded-t-md"
            style={{ width: `${progressPct}%` }}
          />
        </span>
      )}
      <span className="py-1 text-xs font-medium tabular-nums" title={progressLabel}>
        <span aria-hidden="true">
          {progress.current}/{progress.total ?? "?"}
        </span>
        <span className="sr-only">{progressLabel}</span>
      </span>
      {canIncrement && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-white hover:bg-primary/30"
          aria-label={incrementLabel}
          title={incrementLabel}
          disabled={(progress.total !== null && progress.current >= progress.total) || isMutating || mutation.isPending}
          onClick={() => {
            if (!isMutating && !mutation.isPending) mutation.mutate();
          }}
        >
          <Icon
            icon={mutation.isPending ? "lucide:loader-circle" : "lucide:plus"}
            className={mutation.isPending ? "size-3 animate-spin" : "size-3"}
          />
        </Button>
      )}
    </div>
  );
}
