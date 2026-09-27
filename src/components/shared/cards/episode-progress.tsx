import { Icon } from "@iconify/react";
import { useIsMutating, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api";
import { useSession } from "@/lib/auth/client";

interface CardEpisodeProgressProps {
  progress: ApiTypes.EpisodeProgress;
  status?: ApiTypes.ProgressStatus;
  userId: string;
  mediaId: string;
  mediaType: "anime" | "tv";
}

export function CardEpisodeProgress({ progress, status, userId, mediaId, mediaType }: CardEpisodeProgressProps) {
  const { t } = useTranslation();
  const session = useSession();
  const queryClient = useQueryClient();
  const mutationKey = ["increment-episode", mediaType, mediaId, userId];
  const isMutating = useIsMutating({ mutationKey }) > 0;
  const canIncrement = session.data?.user.id === userId && (status === "Watching" || status === "Rewatching");
  const mutation = useMutation({
    mutationKey,
    mutationFn: async () => {
      if (!canIncrement || !progress.next) return;
      await api.post(mediaType === "anime" ? apiEndpoints.animeEpisodeWatch : apiEndpoints.tvShowEpisodeWatch, {
        [mediaType === "anime" ? "animeId" : "tvShowId"]: mediaId,
        episodes: [{ ...progress.next, status: "Completed" }],
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user-progress", mediaType, userId] }),
        queryClient.invalidateQueries({ queryKey: ["active-progress", mediaType, userId] }),
        queryClient.invalidateQueries({ queryKey: [`${mediaType}EpisodeWatch`, mediaId, userId] }),
      ]);
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const progressPct = progress.total ? Math.min(100, Math.round((progress.current / progress.total) * 100)) : 0;

  return (
    <div className="absolute bottom-1 inset-x-0 mx-auto flex items-center w-fit justify-center gap-1 rounded-b-md bg-black/75 pl-1.5 text-white backdrop-blur-xs">
      <span
        className="absolute -top-0.5 left-0 right-0 h-0.5 rounded-t-md bg-white/20 overflow-hidden pointer-events-none"
      >
        <span
          className="block h-full rounded-full bg-primary transition-all duration-300 rounded-t-md"
          style={{ width: `${progressPct}%` }}
        />
      </span>
      <span
        className="py-1 text-xs font-medium tabular-nums"
        title={t("library:episodeProgress", { current: progress.current, total: progress.total ?? "?" })}
      >
        <span aria-hidden="true">
          {progress.current}/{progress.total ?? "?"}
        </span>
        <span className="sr-only">
          {t("library:episodeProgress", { current: progress.current, total: progress.total ?? "?" })}
        </span>
      </span>
      {canIncrement && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-white hover:bg-primary/30"
          aria-label={t("library:markNextEpisodeWatched")}
          title={t("library:markNextEpisodeWatched")}
          disabled={!progress.next || isMutating || mutation.isPending}
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
